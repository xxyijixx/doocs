package models

import (
	"time"

	"gorm.io/gorm"
)

// CustomerServiceSource 客服来源模型
type CustomerServiceSource struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"column:name;not null;size:100" json:"name"`                        // 来源名称
	SourceKey string         `gorm:"column:source_key;not null;uniqueIndex;size:50" json:"source_key"` // 来源唯一标识
	TaskID    *int           `gorm:"column:task_id" json:"task_id"`                                    // DooTask任务ID
	DialogID  *int           `gorm:"column:dialog_id" json:"dialog_id"`                                // DooTask对话ID
	ProjectID *int           `gorm:"column:project_id" json:"project_id"`                              // DooTask项目ID
	ColumnID  int            `gorm:"column:column_id;default:0" json:"column_id"`                      // DooTask列ID
	Config    string         `gorm:"column:config;type:text" json:"config"`                            // 来源配置JSON
	Status    int            `gorm:"column:status;default:1" json:"status"`                            // 状态：1-启用，0-禁用
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

// TableName 指定表名
func (CustomerServiceSource) TableName() string {
	return "cs_sources"
}

// CustomerServiceSourceConfig 来源配置结构
type CustomerServiceSourceConfig struct {
	// 基本消息设置
	WelcomeMessage string `json:"welcome_message"`
	OfflineMessage string `json:"offline_message"`

	// 工作时间设置
	WorkingHours WorkingHoursData `json:"working_hours"`

	// 自动回复设置
	AutoReply AutoReplyData `json:"auto_reply"`

	// 客服分配设置
	AgentAssignment AgentAssignmentData `json:"agent_assignment"`

	// 界面设置
	UI UIData `json:"ui"`
}

// CreateSourceRequest 创建来源请求结构
type CreateSourceRequest struct {
	Name      string                      `json:"name" binding:"required"`       // 来源名称
	TaskID    *int                        `json:"task_id" binding:"required"`    // DooTask任务ID
	DialogID  *int                        `json:"dialog_id" binding:"required"`  // DooTask对话ID
	ProjectID *int                        `json:"project_id" binding:"required"` // DooTask项目ID
	ColumnID  int                         `json:"column_id"`                     // DooTask列ID
	Config    CustomerServiceSourceConfig `json:"config" binding:"required"`     // 来源配置
}

// CreateSourceResponse 创建来源响应结构
type CreateSourceResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	SourceKey string `json:"source_key"`
	TaskID    *int   `json:"task_id"`
	DialogID  *int   `json:"dialog_id"`
	ProjectID *int   `json:"project_id"`
	ColumnID  int    `json:"column_id"`
}
