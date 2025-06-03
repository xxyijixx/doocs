package models

import (
	"time"

	"gorm.io/gorm"
)

// CustomerServiceSource 客服来源模型
type CustomerServiceSource struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"column:name;not null;size:100" json:"name"`                       // 来源名称
	SourceKey string         `gorm:"column:source_key;not null;uniqueIndex;size:50" json:"sourceKey"` // 来源唯一标识
	TaskID    *int           `gorm:"column:task_id" json:"taskId"`                                    // DooTask任务ID
	DialogID  *int           `gorm:"column:dialog_id" json:"dialogId"`                                // DooTask对话ID
	ProjectID *int           `gorm:"column:project_id" json:"projectId"`                              // DooTask项目ID
	Config    string         `gorm:"column:config;type:text" json:"config"`                           // 来源配置JSON
	Status    int            `gorm:"column:status;default:1" json:"status"`                           // 状态：1-启用，0-禁用
	CreatedAt time.Time      `gorm:"column:created_at" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"-"`
}

// TableName 指定表名
func (CustomerServiceSource) TableName() string {
	return "customer_service_sources"
}

// CustomerServiceSourceConfig 来源配置结构
type CustomerServiceSourceConfig struct {
	// 基本消息设置
	WelcomeMessage string `json:"welcomeMessage"`
	OfflineMessage string `json:"offlineMessage"`

	// 工作时间设置
	WorkingHours WorkingHoursData `json:"workingHours"`

	// 自动回复设置
	AutoReply AutoReplyData `json:"autoReply"`

	// 客服分配设置
	AgentAssignment AgentAssignmentData `json:"agentAssignment"`

	// 界面设置
	UI UIData `json:"ui"`
}

// CreateSourceRequest 创建来源请求结构
type CreateSourceRequest struct {
	Name      string                      `json:"name" binding:"required"`      // 来源名称
	TaskID    *int                        `json:"taskId" binding:"required"`    // DooTask任务ID
	DialogID  *int                        `json:"dialogId" binding:"required"`  // DooTask对话ID
	ProjectID *int                        `json:"projectId" binding:"required"` // DooTask项目ID
	Config    CustomerServiceSourceConfig `json:"config" binding:"required"`    // 来源配置
}

// CreateSourceResponse 创建来源响应结构
type CreateSourceResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	SourceKey string `json:"sourceKey"`
	TaskID    *int   `json:"taskId"`
	DialogID  *int   `json:"dialogId"`
	ProjectID *int   `json:"projectId"`
}
