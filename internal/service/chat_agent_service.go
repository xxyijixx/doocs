package service

import (
	"errors"
	"time"

	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/websocket"
)

type ChatAgentService struct{}

var ChatAgent = ChatAgentService{}

// SendMessageByAgent 客服发送消息
func (s *ChatAgentService) SendMessageByAgent(conversationID int, content, sender, msgType, metadata string) (*models.Message, error) {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return nil, errors.New("对话不存在")
	}

	// 如果消息类型为空，设置默认值
	if msgType == "" {
		msgType = "text"
	}

	// 获取当前时间
	now := time.Now()

	// 创建消息
	message := models.Message{
		ConversationID: conversation.ID,
		Content:        content,
		Sender:         sender,
		Type:           msgType,
		Metadata:       metadata,
		CreatedAt:      now,
	}

	// 保存消息
	result = database.DB.Create(&message)
	if result.Error != nil {
		return nil, result.Error
	}

	// 更新对话的最后更新时间和最后消息时间
	database.DB.Model(&conversation).Updates(map[string]interface{}{
		"updated_at":      now,
		"last_message_at": now,
	})

	// 如果是客服发送的消息，通过WebSocket广播给客户
	if sender == "agent" {
		go websocket.BroadcastMessage(conversation.Uuid, map[string]interface{}{
			"content": content,
		}, websocket.MessageTypeNewMessage)
	}

	return &message, nil
}

// GetAgentConversations 获取客服的所有对话
func (s *ChatAgentService) GetAgentConversations(agentID uint, page, pageSize int, status, keyword string) ([]models.Conversations, int64, error) {
	// 构建查询
	query := database.DB.Model(&models.Conversations{})
	// 可以根据需要添加客服ID过滤
	// query = query.Where("agent_id = ?", agentID)

	// 应用状态筛选
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	// 计算总数
	var total int64
	query.Count(&total)

	// 分页查询
	var conversations []models.Conversations
	query = query.Order("updated_at DESC")
	query = query.Offset((page - 1) * pageSize).Limit(pageSize)
	result := query.Find(&conversations)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return conversations, total, nil
}

// GetConversationByUUID 根据UUID获取对话信息
func (s *ChatAgentService) GetConversationByUUID(uuid string) (*models.Conversations, error) {
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		return nil, errors.New("对话不存在")
	}

	return &conversation, nil
}

// GetMessageListByConversationID 根据对话ID获取消息列表
func (s *ChatAgentService) GetMessageListByConversationID(conversationID, page, pageSize int) ([]models.Message, int64, error) {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("id = ?", conversationID).First(&conversation)
	if result.Error != nil {
		return nil, 0, errors.New("对话不存在")
	}

	// 计算总数
	var total int64
	database.DB.Model(&models.Message{}).Where("conversation_id = ?", conversation.ID).Count(&total)

	// 查询最新的消息
	var messages []models.Message
	result = database.DB.Where("conversation_id = ?", conversation.ID).
		Order("created_at DESC"). // 降序排列，获取最新消息
		Limit(pageSize).          // 限制返回数量
		Find(&messages)

	// 反转切片，使消息按时间正序排列
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return messages, total, nil
}

// CloseConversation 关闭对话
func (s *ChatAgentService) CloseConversation(uuid string, agentID uint) error {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		return errors.New("对话不存在或无权操作")
	}

	// 更新对话状态
	conversation.Status = "closed"
	conversation.UpdatedAt = time.Now()
	result = database.DB.Save(&conversation)

	if result.Error != nil {
		return result.Error
	}

	// 发送系统消息
	systemMessage := models.Message{
		ConversationID: conversation.ID,
		Content:        "对话已关闭",
		Sender:         "system",
		Type:           "system",
		CreatedAt:      time.Now(),
	}

	database.DB.Create(&systemMessage)

	// 通过WebSocket通知客户对话已关闭
	go websocket.BroadcastMessage(conversation.Uuid, map[string]interface{}{
		"status":  "closed",
		"message": "对话已关闭",
	}, websocket.MessageTypeNotification)

	return nil
}
