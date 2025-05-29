package middleware

import (
	"fmt"

	"github.com/gin-gonic/gin"

	"support-plugin/internal/pkg/response"
)

// AgentAuthMiddleware 客服认证中间件
func AgentAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取认证配置
		// db := database.GetDB()
		// authConfig, err := models.LoadConfig[models.AuthConfig](db, models.CSConfigKeyAuth)
		// if err != nil || !authConfig.RequireAgentAuth {
		// 	// 如果配置不存在或不需要认证，直接通过
		// 	c.Next()
		// 	return
		// }

		// 获取Authorization头
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "未提供认证令牌")
			c.Abort()
			return
		}

		// 将客服信息存储到上下文中
		// c.Set("agent_id", claims.AgentID)
		// c.Set("username", claims.Username)
		c.Set("agent_id", 1)
		c.Set("username", "客服0001")
		c.Next()
	}
}

// 获取当前认证的客服ID
func GetCurrentAgentID(c *gin.Context) (uint, bool) {
	agentID, exists := c.Get("agent_id")
	fmt.Println("agent_id:", agentID)
	if !exists {
		return 0, false
	}

	// 由于middleware中设置的是int类型的1,需要先转换为int再转uint
	if id, ok := agentID.(int); ok {
		return uint(id), true
	}

	// 尝试直接转换uint类型
	if id, ok := agentID.(uint); ok {
		return id, true
	}

	return 0, false
}
