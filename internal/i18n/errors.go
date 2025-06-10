package i18n

// ErrorCode 错误代码类型
type ErrorCode string

// 系统级错误代码
const (
	// 通用错误
	ErrCodeSuccess           ErrorCode = "SUCCESS"
	ErrCodeInternalError     ErrorCode = "INTERNAL_ERROR"
	ErrCodeInvalidParameter  ErrorCode = "INVALID_PARAMETER"
	ErrCodeUnauthorized      ErrorCode = "UNAUTHORIZED"
	ErrCodeForbidden         ErrorCode = "FORBIDDEN"
	ErrCodeNotFound          ErrorCode = "NOT_FOUND"
	ErrCodeRequestTimeout    ErrorCode = "REQUEST_TIMEOUT"
	ErrCodeTooManyRequests   ErrorCode = "TOO_MANY_REQUESTS"

	// 认证相关错误
	ErrCodeTokenInvalid      ErrorCode = "TOKEN_INVALID"
	ErrCodeTokenExpired      ErrorCode = "TOKEN_EXPIRED"
	ErrCodeLoginFailed       ErrorCode = "LOGIN_FAILED"
	ErrCodeAccountDisabled   ErrorCode = "ACCOUNT_DISABLED"
	ErrCodePermissionDenied  ErrorCode = "PERMISSION_DENIED"
	ErrCodeInvalidCredentials ErrorCode = "INVALID_CREDENTIALS"
	ErrCodeUnauthenticated   ErrorCode = "UNAUTHENTICATED"
	ErrCodeUsernameExists    ErrorCode = "USERNAME_EXISTS"
	ErrCodeInvalidParams     ErrorCode = "INVALID_PARAMS"

	// 对话相关错误
	ErrCodeConversationNotFound ErrorCode = "CONVERSATION_NOT_FOUND"
	ErrCodeConversationClosed   ErrorCode = "CONVERSATION_CLOSED"
	ErrCodeConversationExists   ErrorCode = "CONVERSATION_EXISTS"

	// 消息相关错误
	ErrCodeMessageSendFailed   ErrorCode = "MESSAGE_SEND_FAILED"
	ErrCodeMessageNotFound     ErrorCode = "MESSAGE_NOT_FOUND"
	ErrCodeMessageFormatError  ErrorCode = "MESSAGE_FORMAT_ERROR"

	// 来源相关错误
	ErrCodeSourceNotFound      ErrorCode = "SOURCE_NOT_FOUND"
	ErrCodeSourceDisabled      ErrorCode = "SOURCE_DISABLED"
	ErrCodeSourceConfigError   ErrorCode = "SOURCE_CONFIG_ERROR"

	// 客服相关错误
	ErrCodeAgentNotFound       ErrorCode = "AGENT_NOT_FOUND"
	ErrCodeAgentOffline        ErrorCode = "AGENT_OFFLINE"
	ErrCodeAgentBusy           ErrorCode = "AGENT_BUSY"

	// DooTask相关错误
	ErrCodeDooTaskDataFormat           ErrorCode = "DOOTASK_DATA_FORMAT_ERROR"
	ErrCodeDooTaskResponseFormat       ErrorCode = "DOOTASK_RESPONSE_FORMAT_ERROR"
	ErrCodeDooTaskRequestFailed        ErrorCode = "DOOTASK_REQUEST_FAILED"
	ErrCodeDooTaskUnmarshalResponse    ErrorCode = "DOOTASK_UNMARSHAL_RESPONSE_ERROR"
	ErrCodeDooTaskRequestFailedWithErr ErrorCode = "DOOTASK_REQUEST_FAILED_WITH_ERROR"

	// 数据库相关错误
	ErrCodeDatabaseError       ErrorCode = "DATABASE_ERROR"
	ErrCodeRecordNotFound      ErrorCode = "RECORD_NOT_FOUND"
	ErrCodeDuplicateRecord     ErrorCode = "DUPLICATE_RECORD"

	// 文件相关错误
	ErrCodeFileNotFound        ErrorCode = "FILE_NOT_FOUND"
	ErrCodeFileUploadFailed    ErrorCode = "FILE_UPLOAD_FAILED"
	ErrCodeFileFormatError     ErrorCode = "FILE_FORMAT_ERROR"
	ErrCodeFileSizeExceeded    ErrorCode = "FILE_SIZE_EXCEEDED"

	// 配置相关错误
	ErrCodeConfigError         ErrorCode = "CONFIG_ERROR"
	ErrCodeConfigNotFound      ErrorCode = "CONFIG_NOT_FOUND"

	// 网络相关错误
	ErrCodeNetworkError        ErrorCode = "NETWORK_ERROR"
	ErrCodeConnectionFailed    ErrorCode = "CONNECTION_FAILED"
	ErrCodeConnectionTimeout   ErrorCode = "CONNECTION_TIMEOUT"

	// 事件总线相关错误
	ErrCodeEventBusClosed      ErrorCode = "EVENT_BUS_CLOSED"
	ErrCodeEventQueueFull      ErrorCode = "EVENT_QUEUE_FULL"
	ErrCodeEventTypeError      ErrorCode = "EVENT_TYPE_ERROR"
	ErrCodeEventProcessFailed  ErrorCode = "EVENT_PROCESS_FAILED"

	// 版本相关错误
	ErrCodeVersionFormatError  ErrorCode = "VERSION_FORMAT_ERROR"
	ErrCodeVersionParseError   ErrorCode = "VERSION_PARSE_ERROR"
)

// ErrorInfo 错误信息结构
type ErrorInfo struct {
	Code    ErrorCode `json:"code"`
	Message string    `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Error 实现error接口
func (e *ErrorInfo) Error() string {
	return e.Message
}

// GetCode 获取错误代码
func (e *ErrorInfo) GetCode() ErrorCode {
	return e.Code
}

// NewError 创建新的错误信息
func NewError(code ErrorCode, lang Language, args ...interface{}) *ErrorInfo {
	message := T(lang, string(code), args...)
	return &ErrorInfo{
		Code:    code,
		Message: message,
	}
}

// NewErrorWithData 创建带数据的错误信息
func NewErrorWithData(code ErrorCode, lang Language, data interface{}, args ...interface{}) *ErrorInfo {
	message := T(lang, string(code), args...)
	return &ErrorInfo{
		Code:    code,
		Message: message,
		Data:    data,
	}
}

// IsErrorCode 检查错误是否为指定代码
func IsErrorCode(err error, code ErrorCode) bool {
	if errInfo, ok := err.(*ErrorInfo); ok {
		return errInfo.Code == code
	}
	return false
}