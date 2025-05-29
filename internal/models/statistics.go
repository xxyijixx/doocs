package models

import "time"

// ChatStatistics 聊天统计结构体
type ChatStatistics struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	Date                time.Time `gorm:"column:date;not null" json:"date"`                                  // 统计日期
	AgentID             uint      `gorm:"column:agent_id;default:0" json:"agent_id"`                         // 客服ID，0表示所有客服
	NewConversations    int       `gorm:"column:new_conversations;default:0" json:"new_conversations"`       // 新会话数
	ClosedConversations int       `gorm:"column:closed_conversations;default:0" json:"closed_conversations"` // 关闭会话数
	TotalMessages       int       `gorm:"column:total_messages;default:0" json:"total_messages"`             // 消息总数
	AgentMessages       int       `gorm:"column:agent_messages;default:0" json:"agent_messages"`             // 客服消息数
	CustomerMessages    int       `gorm:"column:customer_messages;default:0" json:"customer_messages"`       // 客户消息数
	AvgResponseTime     int       `gorm:"column:avg_response_time;default:0" json:"avg_response_time"`       // 平均响应时间（秒）
	CreatedAt           time.Time `gorm:"column:created_at" json:"created_at"`                               // 创建时间
	UpdatedAt           time.Time `gorm:"column:updated_at" json:"updated_at"`                               // 更新时间
}

// TableName 指定表名
func (m *ChatStatistics) TableName() string {
	return "cs_statistics"
}
