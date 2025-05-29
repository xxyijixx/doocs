package websocket

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Client 表示一个WebSocket客户端连接
type Client struct {
	Conn       *websocket.Conn
	Send       chan []byte
	ConvUUID   string // 关联的会话UUID
	ClientType string // 客户端类型："agent"或"customer"
}

// Manager 管理所有WebSocket连接
type Manager struct {
	Clients     map[*Client]bool
	ConvClients map[string][]*Client // 按会话UUID组织的客户端
	Register    chan *Client
	Unregister  chan *Client
	Broadcast   chan *Message
	mutex       sync.RWMutex
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
)

// NewManager 创建一个新的WebSocket管理器
func NewManager() *Manager {
	return &Manager{
		Clients:     make(map[*Client]bool),
		ConvClients: make(map[string][]*Client),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		Broadcast:   make(chan *Message),
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
			}
			m.mutex.Unlock()

		case message := <-m.Broadcast:
			m.mutex.RLock()
			// 向特定会话的所有客户端广播消息
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
