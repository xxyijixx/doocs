package websocket

import (
	"encoding/json"
	"support-plugin/internal/pkg/logger"
	"sync"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

// Client 表示一个WebSocket客户端连接
type Client struct {
	Conn       *websocket.Conn
	Send       chan []byte
	ConvUUID   string // 关联的会话UUID
	ClientType string // 客户端类型："agent"或"customer"
	AgentID    string // 客服ID (如果ClientType是agent)
}

// Manager 管理所有WebSocket连接
type Manager struct {
	Clients      map[*Client]bool
	ConvClients  map[string][]*Client // 按会话UUID组织的客户端
	AgentClients []*Client            // 所有客服连接
	Register     chan *Client
	Unregister   chan *Client
	Broadcast    chan *Message
	mutex        sync.RWMutex
}

// Message 表示通过WebSocket发送的消息
type Message struct {
	ConvUUID string          `json:"conv_uuid"`
	Data     json.RawMessage `json:"data"`
	Sender   string          `json:"sender"`
	Type     MessageType     `json:"type"` // 消息类型："message", "notification", 等
}

// MessageType 定义消息类型
type MessageType string

const (
	// MessageTypeMessage 普通消息
	MessageTypeMessage MessageType = "message"
	// MessageTypeNotification 通知消息
	MessageTypeNotification MessageType = "notification"
	// MessageTypeAgentOnlineStatus 坐席在线状态消息
	MessageTypeAgentOnlineStatus MessageType = "agent_online_status"
	// MessageTypeAgentTypingStatus 坐席输入状态消息
	MessageTypeAgentTypingStatus MessageType = "agent_typing_status"
	// MessageTypeCustomerTypingStatus 客户输入状态消息
	MessageTypeCustomerTypingStatus MessageType = "customer_typing_status"
	// MessageTypeNewConversation 新会话通知
	MessageTypeNewConversation MessageType = "new_conversation"
	// MessageTypeNewMessage 新消息通知
	MessageTypeNewMessage MessageType = "new_message"
)

// NewManager 创建一个新的WebSocket管理器
func NewManager() *Manager {
	return &Manager{
		Clients:      make(map[*Client]bool),
		ConvClients:  make(map[string][]*Client),
		AgentClients: make([]*Client, 0),
		Register:     make(chan *Client, 1000),
		Unregister:   make(chan *Client, 1000),  // 增加缓冲区大小
		Broadcast:    make(chan *Message, 1000), // 增加缓冲区大小
	}
}

// Start 启动WebSocket管理器
func (m *Manager) Start() {
	defer func() {
		if err := recover(); err != nil {
			logger.App.Error("WebSocketManager Start panic", zap.Any("error", err))
		}
	}()

	for {
		select {
		case client := <-m.Register:
			m.handleRegister(client)

		case client := <-m.Unregister:
			m.handleUnregister(client)

		case message := <-m.Broadcast:
			m.handleBroadcast(message)
		}
	}
}

// handleRegister 处理客户端注册
func (m *Manager) handleRegister(client *Client) {
	logger.App.Info("Manager 接收到新客户端",
		zap.String("remoteAddr", client.Conn.RemoteAddr().String()),
		zap.String("ClientType", client.ClientType))

	m.mutex.Lock()
	defer m.mutex.Unlock()

	m.Clients[client] = true

	// 将客户端添加到对应会话的客户端列表
	if client.ConvUUID != "" {

		// 如果是新客户创建的会话，向所有客服推送新会话通知
		if client.ClientType == "customer" {
			m.ConvClients[client.ConvUUID] = append(m.ConvClients[client.ConvUUID], client)
			logger.App.Info("New customer conversation created",
				zap.String("convUUID", client.ConvUUID),
				zap.String("remoteAddr", client.Conn.RemoteAddr().String()))
			// 在锁外异步通知，避免死锁
			go m.notifyAgentsNewConversation(client.ConvUUID)
		}
	}

	// 如果是客服，将其添加到客服连接列表
	if client.ClientType == "agent" {
		logger.App.Info("Agent client connected",
			zap.String("agentID", client.AgentID),
			zap.String("remoteAddr", client.Conn.RemoteAddr().String()))
		m.AgentClients = append(m.AgentClients, client)
	}

	logger.App.Info("Manager 完成新客户端处理",
		zap.String("remoteAddr", client.Conn.RemoteAddr().String()),
		zap.String("ClientType", client.ClientType))
}

// handleUnregister 处理客户端注销
func (m *Manager) handleUnregister(client *Client) {
	logger.App.Info("Manager 接收到客户端注销请求",
		zap.String("remoteAddr", client.Conn.RemoteAddr().String()),
		zap.String("ClientType", client.ClientType))

	m.mutex.Lock()
	defer m.mutex.Unlock()

	if _, ok := m.Clients[client]; ok {
		delete(m.Clients, client)
		close(client.Send)

		// 从 ConvClients 中移除
		m.removeFromConvClients(client)

		// 从 AgentClients 中移除
		if client.ClientType == "agent" {
			m.removeFromAgentClients(client)
		}
	}

	logger.App.Info("Manager 完成客户端注销处理",
		zap.String("remoteAddr", client.Conn.RemoteAddr().String()),
		zap.String("ClientType", client.ClientType))
}

// removeFromConvClients 从会话客户端列表中移除客户端
func (m *Manager) removeFromConvClients(client *Client) {
	if client.ConvUUID != "" {
		if clients, ok := m.ConvClients[client.ConvUUID]; ok {
			for i, c := range clients {
				if c == client {
					m.ConvClients[client.ConvUUID] = append(clients[:i], clients[i+1:]...)
					// 如果会话中没有其他客户端了，清理该会话的条目
					if len(m.ConvClients[client.ConvUUID]) == 0 {
						delete(m.ConvClients, client.ConvUUID)
					}
					break
				}
			}
		}
	}
}

// removeFromAgentClients 从客服客户端列表中移除客户端
func (m *Manager) removeFromAgentClients(client *Client) {
	for i, c := range m.AgentClients {
		if c == client {
			// 安全地从切片中移除元素
			copy(m.AgentClients[i:], m.AgentClients[i+1:])
			m.AgentClients[len(m.AgentClients)-1] = nil // 避免内存泄漏
			m.AgentClients = m.AgentClients[:len(m.AgentClients)-1]
			break
		}
	}
}

// handleBroadcast 处理广播消息
func (m *Manager) handleBroadcast(message *Message) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	// 收集需要移除的客户端
	var failedClients []*Client

	// 向特定会话的所有客户端广播消息
	if message.ConvUUID != "" {
		// 如果是普通消息，并且是客户发送的，向所有客服推送新消息通知
		if message.Type == MessageTypeMessage && message.Sender == "customer" {
			logger.App.Info("向客服推送新消息",
				zap.String("convUUID", message.ConvUUID),
				zap.String("remoteAddr", message.ConvUUID))
			// 异步通知，避免死锁
			go m.notifyAgentsNewMessage(message.ConvUUID, message.Data)
		}

		// 向会话中的所有客户端发送消息
		if clients, ok := m.ConvClients[message.ConvUUID]; ok {
			for _, client := range clients {
				select {
				case client.Send <- message.Data:
					// 发送成功
				default:
					// 发送失败，记录需要移除的客户端
					failedClients = append(failedClients, client)
				}
			}
		}
	} else if message.Type == MessageTypeNewConversation || message.Type == MessageTypeNewMessage {
		// 向所有客服广播新会话或新消息通知
		for _, client := range m.AgentClients {
			select {
			case client.Send <- message.Data:
				// 发送成功
			default:
				// 发送失败，记录需要移除的客户端
				failedClients = append(failedClients, client)
			}
		}
	}

	// 异步处理失败的客户端，避免死锁
	if len(failedClients) > 0 {
		go m.cleanupFailedClients(failedClients)
	}
}

// cleanupFailedClients 清理发送失败的客户端
func (m *Manager) cleanupFailedClients(clients []*Client) {
	logger.App.Warn("存在发送失败的客户端，开始清理",
		zap.Int("failedCount", len(clients)))
	for _, client := range clients {
		// 关闭发送通道
		close(client.Send)
		// 通过 Unregister 通道移除客户端
		select {
		case m.Unregister <- client:
		default:
			// 如果 Unregister 通道满了，记录错误但不阻塞
			logger.App.Error("Failed to unregister client, channel full",
				zap.String("clientType", client.ClientType))
		}
	}
}

// SendToConversation 向特定会话的所有客户端发送消息
func (m *Manager) SendToConversation(convUUID string, message []byte) {
	logger.App.Info("开始向会话发送消息",
		zap.String("convUUID", convUUID),
		zap.Int("messageLength", len(message)))

	m.mutex.RLock()
	clients, ok := m.ConvClients[convUUID]
	if !ok {
		m.mutex.RUnlock()
		logger.App.Warn("未找到会话对应的客户端",
			zap.String("convUUID", convUUID))
		return
	}

	// 创建客户端副本以避免在锁外操作时的竞争条件
	clientsCopy := make([]*Client, len(clients))
	copy(clientsCopy, clients)
	m.mutex.RUnlock()

	logger.App.Info("准备向会话客户端发送消息",
		zap.String("convUUID", convUUID),
		zap.Int("clientCount", len(clientsCopy)))

	var failedClients []*Client

	for _, client := range clientsCopy {
		select {
		case client.Send <- message:
			// 发送成功
			logger.App.Debug("消息发送成功",
				zap.String("convUUID", convUUID),
				zap.String("clientAddr", client.Conn.RemoteAddr().String()))
		default:
			// 发送失败
			logger.App.Error("消息发送失败",
				zap.String("convUUID", convUUID),
				zap.String("clientAddr", client.Conn.RemoteAddr().String()))
			failedClients = append(failedClients, client)
		}
	}

	// 清理失败的客户端
	if len(failedClients) > 0 {
		logger.App.Warn("存在发送失败的客户端，开始清理",
			zap.String("convUUID", convUUID),
			zap.Int("failedCount", len(failedClients)))
		go m.cleanupFailedClients(failedClients)
	}

	logger.App.Info("会话消息发送完成",
		zap.String("convUUID", convUUID),
		zap.Int("successCount", len(clientsCopy)-len(failedClients)),
		zap.Int("failedCount", len(failedClients)))
}

// GetClientsCount 获取特定会话的客户端数量
func (m *Manager) GetClientsCount(convUUID string) int {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	if clients, ok := m.ConvClients[convUUID]; ok {
		return len(clients)
	}
	return 0
}

// GetAllClientsCount 获取所有客户端数量
func (m *Manager) GetAllClientsCount() int {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	return len(m.Clients)
}

// WebSocketManager 全局WebSocket管理器实例
var WebSocketManager = NewManager()

// notifyAgentsNewConversation 向所有客服推送新会话通知
func (m *Manager) notifyAgentsNewConversation(convUUID string) {
	// 创建新会话通知消息
	// 使用messages.go中定义的新会话数据结构
	dataContent := NewConversationData{
		ConvUUID: convUUID,
	}

	// 将匿名结构体序列化为json.RawMessage
	dataBytes, err := json.Marshal(dataContent)
	if err != nil {
		logger.App.Error("Failed to marshal new conversation data content", zap.Error(err))
		return
	}

	// 创建新会话通知消息
	message := &Message{
		ConvUUID: convUUID,
		Data:     json.RawMessage(dataBytes),
		Sender:   "system",
		Type:     MessageTypeNewConversation,
	}

	// 将消息转换为JSON
	messageJSON, err := json.Marshal(message)
	if err != nil {
		logger.App.Error("Failed to marshal new conversation message", zap.Error(err))
		return
	}

	// 向所有客服推送通知
	m.SendToAllAgents(messageJSON)
}

// notifyAgentsNewMessage 向所有客服推送新消息通知
func (m *Manager) notifyAgentsNewMessage(convUUID string, content json.RawMessage) {
	// 创建新消息通知
	// 使用messages.go中定义的新消息数据结构
	// dataContent := NewMessageData{
	// 	ConvUUID: convUUID,
	// 	Content:  content,
	// }

	// // 将匿名结构体序列化为json.RawMessage
	// dataBytes, err := json.Marshal(dataContent)
	// if err != nil {
	// 	logger.App.Error("Failed to marshal new message data content", zap.Error(err))
	// 	return
	// }

	// 创建新消息通知
	message := &Message{
		ConvUUID: convUUID,
		Data:     content,
		Sender:   "system",
		Type:     MessageTypeNewMessage,
	}

	// 将消息转换为JSON
	messageJSON, err := json.Marshal(message)
	if err != nil {
		logger.App.Error("Failed to marshal new message notification", zap.Error(err))
		return
	}

	// 向所有客服推送通知
	m.SendToAllAgents(messageJSON)
}

// SendToAllAgents 向所有客服发送消息
func (m *Manager) SendToAllAgents(message []byte) {
	m.mutex.RLock()
	// 创建客服客户端副本
	agentsCopy := make([]*Client, len(m.AgentClients))
	copy(agentsCopy, m.AgentClients)
	m.mutex.RUnlock()

	var failedClients []*Client
	logger.App.Info("准备向所有客服发送消息",
		zap.Int("agentCount", len(agentsCopy)))
	for _, client := range agentsCopy {
		select {
		case client.Send <- message:
			// 发送成功
			logger.App.Debug("向客服发送消息成功",
				zap.String("clientAddr", client.Conn.RemoteAddr().String()),
				zap.String("agentID", client.AgentID))
		default:
			// 发送失败
			logger.App.Error("向客服发送消息失败",
				zap.String("clientAddr", client.Conn.RemoteAddr().String()),
				zap.String("agentID", client.AgentID))
			failedClients = append(failedClients, client)
		}
	}

	// 清理失败的客户端
	if len(failedClients) > 0 {
		go m.cleanupFailedClients(failedClients)
	}
}

// GetAgentClientsCount 获取客服连接数量
func (m *Manager) GetAgentClientsCount() int {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	return len(m.AgentClients)
}
