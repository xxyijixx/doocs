package errors

// 业务错误代码
const (
	// 对话相关错误
	ErrCodeConversationNotFound = "CONVERSATION_NOT_FOUND"
	ErrCodeConversationClosed   = "CONVERSATION_CLOSED"
	ErrCodeSourceNotFound       = "SOURCE_NOT_FOUND"

	// 消息相关错误
	ErrCodeMessageSendFailed = "MESSAGE_SEND_FAILED"

	// 认证相关错误
	ErrCodeUnauthorized = "UNAUTHORIZED"
	ErrCodeTokenInvalid = "TOKEN_INVALID"
)

// BusinessError 业务错误结构
type BusinessError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Error 实现error接口
func (e *BusinessError) Error() string {
	return e.Message
}

// GetCode 获取错误代码
func (e *BusinessError) GetCode() string {
	return e.Code
}

// 预定义的业务错误
var (
	ErrConversationNotFound = &BusinessError{
		Code:    ErrCodeConversationNotFound,
		Message: "对话不存在",
	}

	ErrConversationClosed = &BusinessError{
		Code:    ErrCodeConversationClosed,
		Message: "对话已关闭",
	}

	ErrSourceNotFound = &BusinessError{
		Code:    ErrCodeSourceNotFound,
		Message: "来源不存在",
	}

	ErrMessageSendFailed = &BusinessError{
		Code:    ErrCodeMessageSendFailed,
		Message: "消息发送失败",
	}

	ErrUnauthorized = &BusinessError{
		Code:    ErrCodeUnauthorized,
		Message: "未授权访问",
	}

	ErrTokenInvalid = &BusinessError{
		Code:    ErrCodeTokenInvalid,
		Message: "令牌无效",
	}
)

// NewBusinessError 创建新的业务错误
func NewBusinessError(code, message string, data interface{}) *BusinessError {
	return &BusinessError{
		Code:    code,
		Message: message,
		Data:    data,
	}
}

// IsBusinessError 检查是否为业务错误
func IsBusinessError(err error) (*BusinessError, bool) {
	if bizErr, ok := err.(*BusinessError); ok {
		return bizErr, true
	}
	return nil, false
}

// HasCode 检查错误是否包含指定代码
func HasCode(err error, code string) bool {
	if bizErr, ok := IsBusinessError(err); ok {
		return bizErr.Code == code
	}
	return false
}
