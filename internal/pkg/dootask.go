package pkg

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
)

var httpClient = &http.Client{}

type DootaskRobot struct {
	httpClient *http.Client
	Message    *DootaskMessage
	Webhook    string
	Token      string
	Version    string
}

type DootaskMessage struct {
	Token      string `json:"token"`
	Text       string `json:"text"`
	TextType   string `json:"text_type"`
	DialogId   string `json:"dialog_id"`
	DialogIds  string `json:"dialog_ids"`
	DialogType string `json:"dialog_type"`
	MsgId      string `json:"msg_id"`
	MsgUid     string `json:"msg_uid"`
	Mention    string `json:"mention"`
	Silence    string `json:"silence"`
	BotUid     string `json:"bot_uid"`
	Version    string `json:"version"`
}

func (robot *DootaskRobot) SendMsg() (string, error) {
	robot.httpClient = httpClient

	resp, err := http.Post(robot.Webhook, "application/x-www-form-urlencoded", robot.Message.ConvertToParams())
	if err != nil {
		fmt.Println("请求错误", err)
		return "", err
	}
	// 打印响应体
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("读取响应体错误:", err)
		return "", err
	}
	defer resp.Body.Close()
	return string(body), nil
}

// ConvertDootaskMessage 解析 DooTas 消息
func (robot *DootaskRobot) ConvertToMessage(c *gin.Context) *DootaskMessage {
	message := &DootaskMessage{
		Token:    c.PostForm("token"),
		DialogId: c.PostForm("dialog_id"),
		Text:     c.PostForm("text"),
		TextType: c.PostForm("text_type"),
		MsgId:    c.PostForm("msg_id"),
		MsgUid:   c.PostForm("msg_uid"),
		Mention:  c.PostForm("mention"),
		BotUid:   c.PostForm("bot_uid"),
		Version:  c.PostForm("version"),
	}
	robot.Message = message
	return message
}

// ConvertToParams 转换为参数
func (message *DootaskMessage) ConvertToParams() io.Reader {
	param := url.Values{}

	param.Set("version", message.Version)
	param.Set("text", message.Text)
	if message.TextType != "" {
		param.Set("text_type", message.TextType)
	}
	if message.Silence != "" {
		param.Set("silence", message.Silence)
	}
	if message.Mention == "1" {
		if message.MsgId != "" {
			param.Set("reply_id", message.MsgId)
		}
	}

	if message.DialogId != "" {
		param.Set("dialog_id", message.DialogId)
	}
	if message.DialogIds != "" {
		param.Set("dialog_ids", message.DialogIds)
	}
	if message.BotUid != "" {
		param.Set("bot_uid", message.BotUid)
	}
	if message.Token != "" {
		param.Set("token", message.Token)
	}
	payload := bytes.NewBufferString(param.Encode())

	return payload
}
