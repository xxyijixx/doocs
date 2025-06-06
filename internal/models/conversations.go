package models

import (
	"time"

	"gorm.io/gorm"
)

// Agent 客服人员模型
type Agent struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Username      string         `gorm:"column:username;uniqueIndex;not null" json:"username"` // 用户名
	Name          string         `gorm:"column:name" json:"name"`                              // 显示名称
	Avatar        string         `gorm:"column:avatar" json:"avatar"`                          // 头像URL
	Token         string         `gorm:"column:token" json:"-"`                                // 认证令牌，JSON响应中不返回
	DooTaskUserID int            `gorm:"column:dootask_user_id" json:"dootask_user_id"`        // Dootask 用户ID
	LastLogin     *time.Time     `gorm:"column:last_login" json:"last_login"`                  // 最后登录时间
	Status        string         `gorm:"column:status;default:'active'" json:"status"`         // 状态：active, inactive
	CreatedAt     time.Time      `gorm:"column:created_at" json:"created_at"`                  // 创建时间
	UpdatedAt     time.Time      `gorm:"column:updated_at" json:"updated_at"`                  // 更新时间
	DeletedAt     gorm.DeletedAt `gorm:"column:deleted_at" json:"deleted_at"`                  // 删除时间（软删除）
}

// TableName 指定表名
func (a *Agent) TableName() string {
	return "cs_agents"
}

// Customer 客户模型
type Customer struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UUID         string         `gorm:"column:uuid;uniqueIndex;not null" json:"uuid"`        // 客户唯一标识
	Name         string         `gorm:"column:name" json:"name"`                             // 客户名称（可选）
	Email        string         `gorm:"column:email" json:"email"`                           // 电子邮件（可选）
	Phone        string         `gorm:"column:phone" json:"phone"`                           // 电话号码（可选）
	IP           string         `gorm:"column:ip" json:"ip"`                                 // IP地址
	UserAgent    string         `gorm:"column:user_agent;type:text" json:"user_agent"`       // 用户代理
	CustomFields string         `gorm:"column:custom_fields;type:text" json:"custom_fields"` // 自定义字段（JSON格式）
	CreatedAt    time.Time      `gorm:"column:created_at" json:"created_at"`                 // 创建时间
	UpdatedAt    time.Time      `gorm:"column:updated_at" json:"updated_at"`                 // 更新时间
	DeletedAt    gorm.DeletedAt `gorm:"column:deleted_at" json:"deleted_at"`                 // 删除时间（软删除）
}

// TableName 指定表名
func (c *Customer) TableName() string {
	return "cs_customers"
}

// Message 消息结构体（优化版）
type Message struct {
	ID             uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`           // 消息ID
	ConversationID uint      `gorm:"column:conversation_id;not null" json:"conversation_id"` // 所属会话ID
	Content        string    `gorm:"column:content;type:text;not null" json:"content"`       // 消息内容
	Sender         string    `gorm:"column:sender;not null" json:"sender"`                   // 发送者类型('agent','customer')
	SenderID       uint      `gorm:"column:sender_id;default:0" json:"sender_id"`            // 发送者ID
	Type           string    `gorm:"column:type;default:'text'" json:"type"`                 // 消息类型：text, image, file, system
	Metadata       string    `gorm:"column:metadata;type:text" json:"metadata"`              // 元数据（JSON格式，可存储附加信息）
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`                    // 创建时间
}

// TableName 指定表名
func (m *Message) TableName() string {
	return "cs_messages"
}

// Conversations 会话结构体（优化版）
type Conversations struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Uuid            string         `gorm:"column:uuid;uniqueIndex;not null" json:"uuid"`
	AgentID         uint           `gorm:"column:agent_id;default:0" json:"agent_id"`            // 客服ID
	CustomerID      uint           `gorm:"column:customer_id;default:0" json:"customer_id"`      // 客户ID
	Title           string         `gorm:"column:title" json:"title"`                            // 会话标题
	Status          string         `gorm:"column:status;default:'open'" json:"status"`           // 状态：open, closed
	Source          string         `gorm:"column:source;default:'widget'" json:"source"`         // 来源：widget, api, etc.
	SourceKey       string         `gorm:"column:source_key;default:'widget'" json:"source_key"` // 来源：widget, api, etc.
	LastMessage     string         `gorm:"column:last_message" json:"last_message"`              // 最后一条消息内容
	LastMessageAt   *time.Time     `gorm:"column:last_message_at" json:"last_message_at"`        // 最后消息时间
	DooTaskDialogID int            `gorm:"column:dootask_dialog_id" json:"dootask_dialog_id"`    // Dootask 会话ID
	DooTaskTaskID   int            `gorm:"column:dootask_task_id" json:"dootask_task_id"`        // Dootask 任务ID
	CreatedAt       time.Time      `gorm:"column:created_at" json:"created_at"`                  // 创建时间
	UpdatedAt       time.Time      `gorm:"column:updated_at" json:"updated_at"`                  // 更新时间
	DeletedAt       gorm.DeletedAt `gorm:"column:deleted_at" json:"deleted_at"`                  // 删除时间（软删除）
}

// TableName 指定表名
func (m *Conversations) TableName() string {
	return "cs_conversations"
}
