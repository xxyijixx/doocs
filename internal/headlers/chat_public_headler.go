package headlers

import (
	"strconv"

	"support-plugin/internal/models"
	bizErrors "support-plugin/internal/pkg/errors"
	"support-plugin/internal/pkg/response"
	"support-plugin/internal/service"

	"github.com/gin-gonic/gin"
)

type ChatPublicHeadler struct {
}

var ChatPublic = ChatPublicHeadler{}

// @Summary 创建新对话
// @Description 创建客服和客户之间的新对话
// @Accept json
// @Produce json
// @Param request body models.CreateConversationRequest true "创建对话请求参数"
// @Success 200 {object} models.Response{data=models.ConversationResponse}
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat [post]
func (h ChatPublicHeadler) CreateConversation(c *gin.Context) {
	// 解析请求参数
	var req models.CreateConversationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误", err)
		return
	}

	// 创建对话
	uuid, err := service.ChatPublic.CreateConversation(req.AgentID, req.CustomerID, req.Title, req.Source)
	if err != nil {
		response.ServerError(c, "创建对话失败", err)
		return
	}

	response.Success(c, "创建对话成功", models.ConversationResponse{
		UUID: uuid,
	})
}

// @Summary 发送消息
// @Description 在指定对话中发送新消息
// @Accept json
// @Produce json
// @Param request body models.SendMessageRequest true "发送消息请求参数"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/messages [post]
func (h ChatPublicHeadler) SendMessage(c *gin.Context) {
	// 解析请求参数
	var req models.SendMessageRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误", err)
		return
	}

	// 发送消息
	message, err := service.ChatPublic.SendMessage(req.UUID, req.Content, req.Sender, req.Type, req.Metadata)
	if err != nil {
		response.BadRequest(c, "发送消息失败", err)
		return
	}

	// 为客户端简化消息数据
	simplifiedMessage := map[string]interface{}{
		"id":         message.ID,
		"content":    message.Content,
		"sender":     message.Sender,
		"type":       message.Type,
		"created_at": message.CreatedAt,
	}

	response.Success(c, "发送消息成功", simplifiedMessage)
}

// @Summary 获取对话消息列表
// @Description 获取指定对话的消息历史记录
// @Accept json
// @Produce json
// @Param uuid path string true "对话UUID"
// @Param page query int false "页码,默认1"
// @Param page_size query int false "每页数量,默认20"
// @Success 200 {object} models.Response{data=models.PaginationData}
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/{uuid}/messages [get]
func (h ChatPublicHeadler) GetMessages(c *gin.Context) {
	// 获取路径参数
	uuid := c.Param("uuid")
	if uuid == "" {
		response.BadRequest(c, "缺少对话UUID", nil)
		return
	}

	// 获取分页参数
	pageStr := c.DefaultQuery("page", "1")
	pageSizeStr := c.DefaultQuery("page_size", "20")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// 获取消息列表
	messages, total, err := service.ChatPublic.GetMessages(uuid, page, pageSize)
	if err != nil {
		response.BadRequest(c, "获取消息失败", err)
		return
	}

	// 为客户端简化消息数据
	simplifiedMessages := make([]map[string]interface{}, len(messages))
	for i, msg := range messages {
		simplifiedMessages[i] = map[string]interface{}{
			"id":         msg.ID,
			"content":    msg.Content,
			"sender":     msg.Sender,
			"type":       msg.Type,
			"created_at": msg.CreatedAt,
		}
	}

	response.SuccessWithPagination(c, "获取消息成功", simplifiedMessages, total, page, pageSize)
}

// @Summary 获取对话信息
// @Description 获取指定对话的详细信息
// @Accept json
// @Produce json
// @Param uuid path string true "对话UUID"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/{uuid} [get]
func (h ChatPublicHeadler) GetConversation(c *gin.Context) {
	// 获取路径参数
	uuid := c.Param("uuid")
	if uuid == "" {
		response.BadRequest(c, "缺少对话UUID", nil)
		return
	}

	// 获取对话信息
	conversation, err := service.ChatPublic.GetConversation(uuid)
	if err != nil {
		// 检查是否是业务错误
		if bizErr, ok := bizErrors.IsBusinessError(err); ok {
			response.BadRequest(c, bizErr.Message, bizErr)
			return
		}
		response.ServerError(c, "获取对话失败", err)
		return
	}

	// 为客户端简化对话数据
	simplifiedConversation := map[string]interface{}{
		"uuid":            conversation.Uuid,
		"title":           conversation.Title,
		"status":          conversation.Status,
		"source":          conversation.Source,
		"last_message":    conversation.LastMessage,
		"last_message_at": conversation.LastMessageAt,
		"created_at":      conversation.CreatedAt,
	}

	response.Success(c, "获取对话成功", simplifiedConversation)
}
