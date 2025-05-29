package headlers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"support-plugin/internal/middleware"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/response"
)

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
func (h ChatHeadler) GetAgentConversations(c *gin.Context) {
	// 获取当前客服ID
	_, exists := middleware.GetCurrentAgentID(c)
	if !exists {
		response.Unauthorized(c, "未认证")
		return
	}

	// 获取分页参数
	page, pageSize := getPaginationParams(c)

	// 获取状态筛选参数
	status := c.Query("status")

	keyword := c.Query("keyword")

	// 构建查询
	query := database.DB.Model(&models.Conversations{})
	// query = query.Where("agent_id = ?", agentID)

	// 应用状态筛选
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	// 计算总数
	var total int64
	query.Count(&total)

	// 分页查询
	var conversations []models.Conversations
	query = query.Order("updated_at DESC")
	query = query.Offset((page - 1) * pageSize).Limit(pageSize)
	result := query.Find(&conversations)

	if result.Error != nil {
		response.ServerError(c, "获取对话列表失败", result.Error)
		return
	}

	// 计算总页数
	pages := (total + int64(pageSize) - 1) / int64(pageSize)

	// 返回分页数据
	response.Success(c, "获取成功", models.PaginationData{
		Total:    total,
		Page:     page,
		PageSize: pageSize,
		Pages:    pages,
		Items:    conversations,
	})
}

// @Summary 获取指定UUID的对话信息
// @Description 根据对话UUID获取详细的对话信息
// @Accept json
// @Produce json
// @Param uuid path string true "对话UUID"
// @Success 200 {object} models.Response{data=models.Conversations}
// @Failure 400 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /chat/conversations/{uuid} [get]
func (h ChatHeadler) GetConversationByUUID(c *gin.Context) {
	// 获取对话UUID
	uuid := c.Param("uuid")
	if uuid == "" {
		response.BadRequest(c, "缺少对话UUID", nil)
		return
	}

	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		response.BadRequest(c, "对话不存在", result.Error)
		return
	}

	response.Success(c, "获取成功", conversation)
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
func (h ChatHeadler) CloseConversation(c *gin.Context) {
	// 获取当前客服ID
	_, exists := middleware.GetCurrentAgentID(c)
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

	// 查找对话
	var conversation models.Conversations
	result := database.DB.Where("uuid = ?", uuid).First(&conversation)
	if result.Error != nil {
		response.BadRequest(c, "对话不存在或无权操作", result.Error)
		return
	}

	// 更新对话状态
	conversation.Status = "closed"
	conversation.UpdatedAt = time.Now()
	result = database.DB.Save(&conversation)

	if result.Error != nil {
		response.ServerError(c, "关闭对话失败", result.Error)
		return
	}

	// 发送系统消息
	systemMessage := models.Message{
		ConversationID: conversation.ID,
		Content:        "对话已关闭",
		Sender:         "system",
		Type:           "system",
		CreatedAt:      time.Now(),
	}

	database.DB.Create(&systemMessage)

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
