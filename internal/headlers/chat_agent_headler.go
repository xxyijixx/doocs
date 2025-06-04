package headlers

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"support-plugin/internal/middleware"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/response"
	"support-plugin/internal/service"
)

type ChatAgentHeadler struct {
}

var ChatAgent = ChatAgentHeadler{}

// @Summary 发送消息
// @Description 在指定对话中发送新消息
// @Accept json
// @Produce json
// @Param request body models.SendMessageByAgentRequest true "发送消息请求参数"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/agent/messages [post]
func (h ChatAgentHeadler) SendMessageByAgent(c *gin.Context) {
	// 解析请求参数
	var req models.SendMessageByAgentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误", err)
		return
	}

	// 发送消息
	message, err := service.ChatAgent.SendMessageByAgent(req.ID, req.Content, req.Sender, req.Type, req.Metadata)
	if err != nil {
		response.ServerError(c, "发送消息失败", err)
		return
	}

	response.Success(c, "发送消息成功", message)
}

// @Summary 获取客服的所有对话
// @Description 获取当前认证客服的所有对话列表
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer {token}"
// @Param page query int false "页码,默认1"
// @Param page_size query int false "每页数量,默认20"
// @Param status query string false "状态筛选(open/closed)"
// @Param keyword query string false "关键词搜索"
// @Success 200 {object} models.Response{data=models.PaginationData}
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/agent/conversations [get]
func (h ChatAgentHeadler) GetAgentConversations(c *gin.Context) {
	// 获取当前客服ID
	agentID, exists := middleware.GetCurrentAgentID(c)
	if !exists {
		response.Unauthorized(c, "未认证")
		return
	}

	// 获取分页参数
	page, pageSize := getPaginationParams(c)

	// 获取状态筛选参数
	status := c.Query("status")
	keyword := c.Query("keyword")

	// 获取对话列表
	conversations, total, err := service.ChatAgent.GetAgentConversations(agentID, page, pageSize, status, keyword)
	if err != nil {
		response.ServerError(c, "获取对话列表失败", err)
		return
	}

	response.SuccessWithPagination(c, "获取成功", conversations, total, page, pageSize)
}

// @Summary 获取指定UUID的对话信息
// @Description 根据对话UUID获取详细的对话信息
// @Accept json
// @Produce json
// @Param uuid path string true "对话UUID"
// @Success 200 {object} models.Response{data=models.Conversations}
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/agent/conversations/{uuid} [get]
func (h ChatAgentHeadler) GetConversationByUUID(c *gin.Context) {
	// 获取对话UUID
	uuid := c.Param("uuid")
	if uuid == "" {
		response.BadRequest(c, "缺少对话UUID", nil)
		return
	}

	// 获取对话信息
	conversation, err := service.ChatAgent.GetConversationByUUID(uuid)
	if err != nil {
		response.BadRequest(c, "对话不存在", err)
		return
	}

	response.Success(c, "获取成功", conversation)
}

// @Summary 获取对话消息列表
// @Description 获取指定对话的消息历史记录
// @Accept json
// @Produce json
// @Param id path string true "对话ID"
// @Param page query int false "页码,默认1"
// @Param page_size query int false "每页数量,默认20"
// @Success 200 {object} models.Response{data=models.PaginationData}
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/agent/{id}/messages [get]
func (h ChatAgentHeadler) GetMessageListByConversationID(c *gin.Context) {
	// 获取路径参数
	// 将路径参数id转换为int类型
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		response.BadRequest(c, "对话ID格式错误", err)
		return
	}

	// 获取分页参数
	page, pageSize := getPaginationParams(c)

	// 获取消息列表
	messages, total, err := service.ChatAgent.GetMessageListByConversationID(id, page, pageSize)
	if err != nil {
		response.ServerError(c, "获取消息失败", err)
		return
	}

	response.SuccessWithPagination(c, "获取消息成功", messages, total, page, pageSize)
}

// @Summary 关闭对话
// @Description 关闭指定的对话
// @Accept json
// @Produce json
// @Param uuid path string true "对话UUID"
// @Success 200 {object} models.Response
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/agent/{uuid}/close [put]
func (h ChatAgentHeadler) CloseConversation(c *gin.Context) {
	// 获取当前客服ID
	agentID, exists := middleware.GetCurrentAgentID(c)
	if !exists {
		response.Unauthorized(c, "未认证")
		return
	}

	// 获取对话UUID
	uuid := c.Param("uuid")
	if uuid == "" {
		response.BadRequest(c, "缺少对话UUID", nil)
		return
	}

	// 关闭对话
	err := service.ChatAgent.CloseConversation(uuid, agentID)
	if err != nil {
		response.ServerError(c, "关闭对话失败", err)
		return
	}

	response.Success(c, "对话已关闭", nil)
}

// 获取分页参数
func getPaginationParams(c *gin.Context) (int, int) {
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

	return page, pageSize
}
