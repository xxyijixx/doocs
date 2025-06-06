package headlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/response"
)

type AgentHeadler struct{}

var Agent = AgentHeadler{}

// @Summary 获取所有客服
// @Description 获取所有客服列表
// @Accept json
// @Produce json
// @Success 200 {object} models.Response{data=[]models.Agent}
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /agents [get]
func (a *AgentHeadler) List(c *gin.Context) {
	db := database.GetDB()
	var agents []models.Agent
	
	if err := db.Find(&agents).Error; err != nil {
		response.ServerError(c, "获取客服列表失败", err)
		return
	}
	
	response.Success(c, "获取客服列表成功", agents)
}

// EditRequest 编辑客服请求结构
type EditRequest struct {
	DooTaskUserIDs []int `json:"dootask_user_ids" binding:"required"`
}

// @Summary 设置客服
// @Description 提交一组DooTask用户ID，不存在则创建对应的客服人员
// @Accept json
// @Produce json
// @Param request body EditRequest true "DooTask用户ID列表"
// @Success 200 {object} models.Response{data=[]models.Agent}
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /agents [put]
func (a *AgentHeadler) Edit(c *gin.Context) {
	var req EditRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误", err)
		return
	}
	
	db := database.GetDB()
	var agents []models.Agent
	
	// 为每个DooTask用户ID创建或更新客服记录
	for _, userID := range req.DooTaskUserIDs {
		var agent models.Agent
		
		// 查找是否已存在该DooTask用户ID的客服
		err := db.Where("dootask_user_id = ?", userID).First(&agent).Error
		if err != nil {
			// 不存在则创建新客服
			agent = models.Agent{
				Username:      "客服" + strconv.Itoa(userID),
				Name:          "客服" + strconv.Itoa(userID),
				DooTaskUserID: userID,
				Status:        "active",
			}
			
			if err := db.Create(&agent).Error; err != nil {
				response.ServerError(c, "创建客服失败", err)
				return
			}
		} else {
			// 存在则更新状态为active
			agent.Status = "active"
			if err := db.Save(&agent).Error; err != nil {
				response.ServerError(c, "更新客服状态失败", err)
				return
			}
		}
		
		agents = append(agents, agent)
	}
	
	response.Success(c, "设置客服成功", agents)
}

// @Summary 验证客服身份
// @Description 验证当前用户是否具有客服身份
// @Accept json
// @Produce json
// @Success 200 {object} models.Response{data=map[string]interface{}}
// @Failure 401 {object} models.Response
// @Failure 403 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /agents/verify [get]
func (a *AgentHeadler) Verify(c *gin.Context) {
	// 获取当前用户信息
	dootaskUserID, exists := c.Get("dootask_user_id")
	if !exists {
		response.Unauthorized(c, "未找到用户信息")
		return
	}
	
	userID, ok := dootaskUserID.(int)
	if !ok {
		response.BadRequest(c, "用户ID格式错误", nil)
		return
	}
	
	// 检查是否为管理员
	isAdmin := c.GetBool("is_admin")
	
	// 检查是否为客服
	db := database.GetDB()
	var agent models.Agent
	err := db.Where("dootask_user_id = ? AND status = ?", userID, "active").First(&agent).Error
	isAgent := err == nil
	
	// 如果既不是管理员也不是客服，返回403
	if !isAdmin && !isAgent {
		response.Forbidden(c, "您没有访问权限", nil)
		return
	}
	
	// 返回用户权限信息
	response.Success(c, "验证成功", map[string]interface{}{
		"is_admin": isAdmin,
		"is_agent": isAgent,
		"user_id":  userID,
		"agent_info": func() interface{} {
			if isAgent {
				return agent
			}
			return nil
		}(),
	})
}
