package models

// CreateConversationRequest 创建对话请求结构体
type CreateConversationRequest struct {
	AgentID    uint   `json:"agent_id"`
	CustomerID uint   `json:"customer_id"`
	Title      string `json:"title"`                   // 会话标题（可选）
	Source     string `json:"source" default:"widget"` // 来源（可选）
}

// SendMessageRequest 发送消息请求结构体
type SendMessageRequest struct {
	UUID     string `json:"uuid" binding:"required"`
	Content  string `json:"content" binding:"required"`
	Sender   string `json:"sender" binding:"required"` // "agent" 或 "customer"
	Type     string `json:"type" default:"text"`       // 消息类型：text, image, file, system
	Metadata string `json:"metadata"`                  // 元数据（JSON格式，可选）
}

// AgentLoginRequest 客服登录请求结构体
type AgentLoginRequest struct {
	Username string `json:"username" binding:"required"` // 用户名
	Password string `json:"password" binding:"required"` // 密码
}

// AgentTokenRequest 客服令牌验证请求结构体
type AgentTokenRequest struct {
	Token string `json:"token" binding:"required"` // 认证令牌
}
