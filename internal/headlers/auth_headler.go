package headlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"support-plugin/internal/middleware"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/response"
)

type AuthHeadler struct{}

var Auth = AuthHeadler{}

// @Summary 客服登录
// @Description 客服登录并获取认证令牌
// @Accept json
// @Produce json
// @Param request body models.AgentLoginRequest true "登录请求参数"
// @Success 200 {object} models.Response{data=models.AgentLoginResponse}
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /auth/login [post]
func (h AuthHeadler) Login(c *gin.Context) {
	// 解析请求参数
	var req models.AgentLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误", err)
		return
	}

	// 查找客服
	var agent models.Agent
	result := database.DB.Where("username = ?", req.Username).First(&agent)
	if result.Error != nil {
		response.Unauthorized(c, "用户名或密码错误")
		return
	}

	// 检查客服状态
	if agent.Status != "active" {
		response.Unauthorized(c, "账号已被禁用")
		return
	}

	// 更新最后登录时间
	database.DB.Save(&agent)
}

// @Summary 获取当前客服信息
// @Description 获取当前认证客服的详细信息
// @Accept json
// @Produce json
// @Success 200 {object} models.Response{data=models.AgentInfoResponse}
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /auth/me [get]
func (h AuthHeadler) GetCurrentAgent(c *gin.Context) {
	// 获取当前客服ID
	agentID, exists := middleware.GetCurrentAgentID(c)
	if !exists {
		response.Unauthorized(c, "未认证")
		return
	}

	// 查询客服信息
	var agent models.Agent
	result := database.DB.First(&agent, agentID)
	if result.Error != nil {
		response.ServerError(c, "获取客服信息失败", result.Error)
		return
	}

	// 返回响应
	response.Success(c, "获取成功", models.AgentInfoResponse{
		ID:       agent.ID,
		Username: agent.Username,
		Name:     agent.Name,
		Avatar:   agent.Avatar,
		Status:   agent.Status,
	})
}

// @Summary 创建客服账号
// @Description 创建新的客服账号
// @Accept json
// @Produce json
// @Param request body models.Agent true "客服信息"
// @Success 200 {object} models.Response{data=models.AgentInfoResponse}
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /auth/agents [post]
func (h AuthHeadler) CreateAgent(c *gin.Context) {
	// 解析请求参数
	var agent models.Agent
	if err := c.ShouldBindJSON(&agent); err != nil {
		response.BadRequest(c, "参数错误", err)
		return
	}

	// 检查用户名是否已存在
	var count int64
	database.DB.Model(&models.Agent{}).Where("username = ?", agent.Username).Count(&count)
	if count > 0 {
		response.BadRequest(c, "用户名已存在", nil)
		return
	}

	// 设置默认值
	agent.Status = "active"
	agent.CreatedAt = time.Now()
	agent.UpdatedAt = time.Now()

	// 保存到数据库
	result := database.DB.Create(&agent)
	if result.Error != nil {
		response.ServerError(c, "创建客服失败", result.Error)
		return
	}

	// 返回响应
	response.Success(c, "创建成功", models.AgentInfoResponse{
		ID:       agent.ID,
		Username: agent.Username,
		Name:     agent.Name,
		Avatar:   agent.Avatar,
		Status:   agent.Status,
	})
}
