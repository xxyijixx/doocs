package websocket

// NewConversationData 结构体用于新会话通知的消息数据
type NewConversationData struct {
	ConvUUID string `json:"conv_uuid"`
}

// NewMessageData 结构体用于新消息通知的消息数据
type NewMessageData struct {
	ConvUUID string `json:"conv_uuid"`
	Content  string `json:"content"`
}
