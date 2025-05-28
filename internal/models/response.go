package models

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`            // 状态码
	Message string      `json:"message"`         // 响应消息
	Data    interface{} `json:"data"`            // 响应数据
	Error   string      `json:"error,omitempty"` // 错误信息，仅在出错时返回
}

// PaginationData 分页数据结构
type PaginationData struct {
	Total    int64       `json:"total"`     // 总记录数
	Page     int         `json:"page"`      // 当前页码
	PageSize int         `json:"page_size"` // 每页大小
	Pages    int64       `json:"pages"`     // 总页数
	Items    interface{} `json:"items"`     // 分页项目数据
}

// ConversationResponse 对话响应数据
type ConversationResponse struct {
	UUID string `json:"uuid"` // 对话UUID
}

// MessageListResponse 消息列表响应数据
type MessageListResponse struct {
	Messages   interface{} `json:"messages"`   // 消息列表
	Pagination interface{} `json:"pagination"` // 分页信息
}
