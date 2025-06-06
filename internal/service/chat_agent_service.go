package service

import (
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	bizErrors "support-plugin/internal/pkg/errors"
)

type ChatAgentService struct{}

var ChatAgent = &ChatAgentService{}

// SendMessageByAgent 客服发送消息
func (s *ChatAgentService) SendMessageByAgent(conversationID uint, content, msgType, metadata string) (*models.Message, error) {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return nil, bizErrors.ErrConversationNotFound
	}

	// 检查对话是否已关闭
	if conversation.Status == "closed" {
		return nil, bizErrors.ErrConversationClosed
	}

	// 创建消息
	message := models.Message{
		ConversationID: conversationID,
		Content:        content,
		Sender:         "agent",
		Type:           msgType,
		Metadata:       metadata,
	}

	// 保存消息
	result = database.DB.Create(&message)
	if result.Error != nil {
		return nil, result.Error
	}

	// 更新对话的最后消息信息
	database.DB.Model(&conversation).Updates(map[string]interface{}{
		"last_message":    content,
		"last_message_at": message.CreatedAt,
	})

	return &message, nil
}

// GetAgentConversations 获取客服的对话列表
func (s *ChatAgentService) GetAgentConversations(agentID uint, page, pageSize int, status, keyword string) ([]models.Conversations, int64, error) {
	var conversations []models.Conversations
	var total int64

	// 构建查询条件
	query := database.DB.Model(&models.Conversations{})

	// 添加状态筛选
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// 添加关键词搜索
	if keyword != "" {
		query = query.Where("title LIKE ? OR last_message LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	// 获取总数
	query.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("updated_at DESC").Find(&conversations).Error

	return conversations, total, err
}

// GetConversationByUUID 根据UUID获取对话信息
func (s *ChatAgentService) GetConversationByUUID(uuid string) (*models.Conversations, error) {
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		return nil, bizErrors.ErrConversationNotFound
	}
	return &conversation, nil
}

// GetConversationByUUID 根据UUID获取对话信息
func (s *ChatAgentService) GetConversationByDooTasDialogID(dialogID int) (*models.Conversations, error) {
	var conversation models.Conversations
	result := database.DB.Where("dootask_dialog_id = ?", dialogID).First(&conversation)
	if result.Error != nil {
		return nil, bizErrors.ErrConversationNotFound
	}
	return &conversation, nil
}

// GetMessageListByConversationID 根据对话ID获取消息列表
func (s *ChatAgentService) GetMessageListByConversationID(conversationID int, page, pageSize int) ([]models.Message, int64, error) {
	var messages []models.Message
	var total int64

	// 构建查询
	query := database.DB.Model(&models.Message{}).Where("conversation_id = ?", conversationID)

	// 获取总数
	query.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_at ASC").Find(&messages).Error

	return messages, total, err
}

// CloseConversation 关闭对话
func (s *ChatAgentService) CloseConversation(id int, agentID uint) error {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("id = ?", id).First(&conversation)
	if result.Error != nil {
		return bizErrors.ErrConversationNotFound
	}

	// 检查对话是否已经关闭
	if conversation.Status == "closed" {
		return bizErrors.NewBusinessError("CONVERSATION_ALREADY_CLOSED", "对话已经关闭", nil)
	}

	// 更新对话状态为关闭
	result = database.DB.Model(&conversation).Updates(map[string]interface{}{
		"status":   "closed",
		"agent_id": agentID, // 记录关闭对话的客服
	})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

// ReopenConversation 重新打开对话
func (s *ChatAgentService) ReopenConversation(id int, agentID uint) error {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("id = ?", id).First(&conversation)
	if result.Error != nil {
		return bizErrors.ErrConversationNotFound
	}

	// 检查对话是否已经打开
	if conversation.Status == "open" {
		return bizErrors.NewBusinessError("CONVERSATION_ALREADY_OPEN", "对话已经打开", nil)
	}

	// 更新对话状态为打开
	result = database.DB.Model(&conversation).Updates(map[string]interface{}{
		"status":   "open",
		"agent_id": agentID, // 记录重新打开对话的客服
	})

	if result.Error != nil {
		return result.Error
	}

	return nil
}
