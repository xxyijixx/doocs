package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"support-plugin/internal/config"
	"support-plugin/internal/pkg/dootask"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	// 写入超时时间
	writeWait = 10 * time.Second

	// 读取超时时间
	pongWait = 60 * time.Second

	// 发送ping的频率，必须小于pongWait
	pingPeriod = (pongWait * 9) / 10

	// 最大消息大小
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 允许所有CORS请求
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// ServeWs 处理WebSocket请求
func ServeWs(c *gin.Context) {
	// 获取会话UUID
	convUUID := c.Query("conv_uuid")
	if convUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing conversation UUID"})
		return
	}

	// 获取客户端类型
	clientType := c.Query("client_type")
	if clientType != "agent" && clientType != "customer" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid client type, must be 'agent' or 'customer'"})
		return
	}

	// 升级HTTP连接为WebSocket连接
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// 创建新的客户端
	client := &Client{
		Conn:       conn,
		Send:       make(chan []byte, 256),
		ConvUUID:   convUUID,
		ClientType: clientType,
	}

	// 注册新客户端
	WebSocketManager.Register <- client

	// 启动goroutine处理读写操作
	go client.writePump()
	go client.readPump()
}

// readPump 从WebSocket连接读取消息
func (c *Client) readPump() {
	defer func() {
		WebSocketManager.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		// 解析消息
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("error unmarshalling message: %v", err)
			continue
		}

		// 设置发送者和会话UUID
		msg.Sender = c.ClientType
		msg.ConvUUID = c.ConvUUID

		fmt.Println("发送消息到机器人", msg.Sender)
		if msg.Sender == "customer" {
			go func(content string) {
				fmt.Println("发送消息到机器人")
				robot := dootask.DootaskRobot{
					Webhook: config.Cfg.DooTask.WebHook,
					Token:   config.Cfg.DooTask.Token,
					Version: config.Cfg.DooTask.Version,
				}
				robot.Message = &dootask.DootaskMessage{
					Text:     "有一条新消息" + content,
					DialogId: "29",
					Token:    config.Cfg.DooTask.Token,
					Version:  config.Cfg.DooTask.Version,
				}
				result, err := robot.SendMsg()
				fmt.Println("发送消息到机器人", result, err)
			}(msg.Content)
		}

		// 广播消息
		WebSocketManager.Broadcast <- &msg
	}
}

// writePump 向WebSocket连接写入消息
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// 通道已关闭
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// 添加队列中的所有消息
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte("\n"))
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// BroadcastMessage 向特定会话广播消息
func BroadcastMessage(convUUID string, msgType string, content string, sender string) error {
	msg := Message{
		ConvUUID: convUUID,
		Content:  content,
		Sender:   sender,
		Type:     msgType,
	}

	msgBytes, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	WebSocketManager.SendToConversation(convUUID, msgBytes)
	return nil
}
