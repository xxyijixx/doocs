package models

import (
	"time"

	"gorm.io/gorm"
)

// Message 消息结构体
type Message struct {
	ID             uint      `gorm:"column:id;primaryKey;autoIncrement" json:"id"`           // 消息ID
	ConversationID uint      `gorm:"column:conversation_id;not null" json:"conversation_id"` // 所属会话ID
	Content        string    `gorm:"column:content;type:text;not null" json:"content"`       // 消息内容
	Sender         string    `gorm:"column:sender;not null" json:"sender"`                   // 发送者类型('agent','customer')
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`                    // 创建时间
}

// TableName 指定表名
func (m *Message) TableName() string {
	return "cs_messages"
}

type Conversations struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Uuid       string         `gorm:"column:uuid;not null" json:"uuid"`
	AgentID    uint           `gorm:"column:agent_id;default:0" json:"agent_id"`
	CustomerID uint           `gorm:"column:customer_id;default:0" json:"customer_id"`
	CreatedAt  time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"column:deleted_at" json:"deleted_at"`
}

func (m *Conversations) TableName() string {
	return "cs_conversations"
}
