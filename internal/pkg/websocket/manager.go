package websocket

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
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
	ConvUUID string      `json:"conv_uuid"`
	Content  string      `json:"content"`
	Sender   string      `json:"sender"`
	Type     MessageType `json:"type"` // 消息类型："message", "notification", 等
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
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		Broadcast:    make(chan *Message),
	}
}

// Start 启动WebSocket管理器
func (m *Manager) Start() {
	for {
		select {
		case client := <-m.Register:
			m.mutex.Lock()
			m.Clients[client] = true
			// 将客户端添加到对应会话的客户端列表
			if client.ConvUUID != "" {
				m.ConvClients[client.ConvUUID] = append(m.ConvClients[client.ConvUUID], client)

				// 如果是新客户创建的会话，向所有客服推送新会话通知
				if client.ClientType == "customer" {
					m.notifyAgentsNewConversation(client.ConvUUID)
				}
			}

			// 如果是客服，将其添加到客服连接列表
			if client.ClientType == "agent" {
				m.AgentClients = append(m.AgentClients, client)
			}
			m.mutex.Unlock()

		case client := <-m.Unregister:
			m.mutex.Lock()
			if _, ok := m.Clients[client]; ok {
				delete(m.Clients, client)
				close(client.Send)

				// 从会话的客户端列表中移除
				if client.ConvUUID != "" {
					clients := m.ConvClients[client.ConvUUID]
					for i, c := range clients {
						if c == client {
							m.ConvClients[client.ConvUUID] = append(clients[:i], clients[i+1:]...)
							break
						}
					}

					// 如果会话没有客户端了，删除会话条目
					if len(m.ConvClients[client.ConvUUID]) == 0 {
						delete(m.ConvClients, client.ConvUUID)
					}
				}

				// 如果是客服，从客服连接列表中移除
				if client.ClientType == "agent" {
					for i, c := range m.AgentClients {
						if c == client {
							m.AgentClients = append(m.AgentClients[:i], m.AgentClients[i+1:]...)
							break
						}
					}
				}
			}
			m.mutex.Unlock()

		case message := <-m.Broadcast:
			m.mutex.RLock()
			// 向特定会话的所有客户端广播消息
			if message.ConvUUID != "" {
				// 如果是普通消息，并且是客户发送的，向所有客服推送新消息通知
				if message.Type == MessageTypeMessage && message.Sender == "customer" {
					m.notifyAgentsNewMessage(message.ConvUUID, message.Content)
				}

				// 向会话中的所有客户端发送消息
				if clients, ok := m.ConvClients[message.ConvUUID]; ok {
					for _, client := range clients {
						select {
						case client.Send <- []byte(message.Content):
						default:
							close(client.Send)
							m.mutex.RUnlock()
							m.mutex.Lock()
							delete(m.Clients, client)
							m.mutex.Unlock()
							m.mutex.RLock()
						}
					}
				}
			} else if message.Type == MessageTypeNewConversation || message.Type == MessageTypeNewMessage {
				// 向所有客服广播新会话或新消息通知
				for _, client := range m.AgentClients {
					select {
					case client.Send <- []byte(message.Content):
					default:
						close(client.Send)
						m.mutex.RUnlock()
						m.mutex.Lock()
						delete(m.Clients, client)
						m.mutex.Unlock()
						m.mutex.RLock()
					}
				}
			}
			m.mutex.RUnlock()
		}
	}
}

// SendToConversation 向特定会话的所有客户端发送消息
func (m *Manager) SendToConversation(convUUID string, message []byte) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	if clients, ok := m.ConvClients[convUUID]; ok {
		for _, client := range clients {
			select {
			case client.Send <- message:
			default:
				// 如果发送失败，关闭连接并移除客户端
				close(client.Send)
				m.mutex.RUnlock()
				m.mutex.Lock()
				delete(m.Clients, client)
				m.mutex.Unlock()
				m.mutex.RLock()
			}
		}
	}
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
	message := &Message{
		ConvUUID: convUUID,
		Content:  convUUID, // 内容为会话UUID，客服端可以根据UUID获取会话详情
		Sender:   "system",
		Type:     MessageTypeNewConversation,
	}

	// 将消息转换为JSON
	messageJSON, err := json.Marshal(message)
	if err != nil {
		return
	}

	// 向所有客服推送通知
	m.SendToAllAgents(messageJSON)
}

// notifyAgentsNewMessage 向所有客服推送新消息通知
func (m *Manager) notifyAgentsNewMessage(convUUID string, content string) {
	// 创建新消息通知
	message := &Message{
		ConvUUID: convUUID,
		Content:  content, // 消息内容
		Sender:   "system",
		Type:     MessageTypeNewMessage,
	}

	// 将消息转换为JSON
	messageJSON, err := json.Marshal(message)
	if err != nil {
		return
	}

	// 向所有客服推送通知
	m.SendToAllAgents(messageJSON)
}

// SendToAllAgents 向所有客服发送消息
func (m *Manager) SendToAllAgents(message []byte) {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	for _, client := range m.AgentClients {
		select {
		case client.Send <- message:
		default:
			// 如果发送失败，关闭连接并移除客户端
			close(client.Send)
			m.mutex.RUnlock()
			m.mutex.Lock()
			delete(m.Clients, client)
			// 从客服列表中移除
			for i, c := range m.AgentClients {
				if c == client {
					m.AgentClients = append(m.AgentClients[:i], m.AgentClients[i+1:]...)
					break
				}
			}
			m.mutex.Unlock()
			m.mutex.RLock()
		}
	}
}

// GetAgentClientsCount 获取客服连接数量
func (m *Manager) GetAgentClientsCount() int {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	return len(m.AgentClients)
}
