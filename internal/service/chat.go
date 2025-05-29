package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"support-plugin/internal/config"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/dootask"
	"support-plugin/internal/pkg/websocket"
)

type ChatService struct{}

var Chat = ChatService{}

// CreateConversation 创建新对话（基础版本，保留向后兼容性）
func (s *ChatService) CreateConversation() (string, error) {
	return s.CreateConversationWithDetails(0, 0, "", "widget")
}

// CreateConversationWithDetails 创建新对话（详细版本）
func (s *ChatService) CreateConversationWithDetails(agentID, customerID uint, title, source string) (string, error) {
	// 生成UUID
	uuidStr := uuid.New().String()

	// 如果没有提供来源，设置默认值
	if source == "" {
		source = "widget"
	}

	// 创建对话记录
	conversation := models.Conversations{
		Uuid:       uuidStr,
		AgentID:    agentID,
		CustomerID: customerID,
		Title:      title,
		Source:     source,
		Status:     "open",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// 保存到数据库
	result := database.DB.Create(&conversation)
	if result.Error != nil {
		return "", result.Error
	}

	return uuidStr, nil
}

// SendMessage 发送消息（基础版本，保留向后兼容性）
func (s *ChatService) SendMessage(conversationUUID, content, sender string) (*models.Message, error) {
	return s.SendMessageWithDetails(conversationUUID, content, sender, "text", "")
}

// SendMessageWithDetails 发送消息（详细版本）
func (s *ChatService) SendMessageWithDetails(conversationUUID, content, sender, msgType, metadata string) (*models.Message, error) {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", conversationUUID).First(&conversation)
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

	fmt.Println("发送消息到机器人", sender)
	if sender == "customer" {
		// 通过WebSocket广播消息
		go websocket.BroadcastToAllAgents(conversationUUID, websocket.MessageTypeNewMessage, content, sender)
		go func(content string) {
			fmt.Println("发送消息到机器人")
			robot := dootask.DootaskRobot{
				Webhook: config.Cfg.DooTask.WebHook,
				Token:   config.Cfg.DooTask.Token,
				Version: config.Cfg.DooTask.Version,
			}
			robot.Message = &dootask.DootaskMessage{
				Text:     fmt.Sprintf("有一条新消息:\n%s", content),
				DialogId: "22",
				Token:    config.Cfg.DooTask.Token,
				Version:  config.Cfg.DooTask.Version,
			}
			result, err := robot.SendMsg()
			fmt.Println("发送消息到机器人", result, err)
		}(content)
	}

	if sender == "agent" {
		// 通过WebSocket广播消息
		go websocket.BroadcastMessage(conversationUUID, websocket.MessageTypeNewMessage, content, sender)
	}

	return &message, nil
}

// GetMessages 获取对话消息列表
func (s *ChatService) GetMessages(conversationUUID string, page, pageSize int) ([]models.Message, int64, error) {
	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", conversationUUID).First(&conversation)
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

// GetConversationByUUID 通过UUID获取对话
func (s *ChatService) GetConversationByUUID(uuid string) (*models.Conversations, error) {
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		return nil, errors.New("对话不存在")
	}

	return &conversation, nil
}
