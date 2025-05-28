package models

// CreateConversationRequest 创建对话请求结构体
type CreateConversationRequest struct {
	AgentID    uint `json:"agent_id" binding:"required"`
	CustomerID uint `json:"customer_id" binding:"required"`
}

// SendMessageRequest 发送消息请求结构体
type SendMessageRequest struct {
	UUID    string `json:"uuid" binding:"required"`
	Content string `json:"content" binding:"required"`
	Sender  string `json:"sender" binding:"required"` // "agent" 或 "customer"
}
