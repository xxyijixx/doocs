package middleware

import (
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"support-plugin/internal/config"
	"support-plugin/internal/pkg/logger"
	"support-plugin/internal/pkg/response"
	"support-plugin/internal/service"
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

		if config.Cfg.App.Mode == "dootask" {
			dootaskToken := Token(c)
			dootaskService := service.NewIDootaskService()
			userInfoResp, err := dootaskService.GetUserInfo(dootaskToken)
			if err != nil {
				response.Unauthorized(c, err.Error())
				c.Abort()
				return
			}
			logger.App.Debug("userInfoResp:", zap.Any("userInfoResp", userInfoResp))
			c.Set("agent_id", userInfoResp.Userid)
			c.Set("username", "客服0001")
		} else {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				response.Unauthorized(c, "未提供认证令牌")
				c.Abort()
				return
			}
			c.Set("agent_id", 1)
			c.Set("username", "客服0001")
		}

		// 将客服信息存储到上下文中
		// c.Set("agent_id", claims.AgentID)
		// c.Set("username", claims.Username)

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

// Token 获取Token（Header、Query、Cookie）
func Token(c *gin.Context) string {
	token := c.GetHeader("token")
	if token == "" {
		token = Input(c, "token")
	}
	if token == "" {
		token = Cookie(c, "token")
	}
	return token
}

// Version 获取Version（Header、Query、Cookie）
func Version(c *gin.Context) string {
	token := c.GetHeader("version")
	if token == "" {
		token = Input(c, "version")
	}
	if token == "" {
		token = Cookie(c, "version")
	}
	return token
}

// Input 获取参数（优先POST、取Query）
func Input(c *gin.Context, key string) string {
	if c.PostForm(key) != "" {
		return strings.TrimSpace(c.PostForm(key))
	}
	return strings.TrimSpace(c.Query(key))
}

// Scheme 获取Scheme
func Scheme(c *gin.Context) string {
	scheme := "http://"
	if c.Request.TLS != nil || c.Request.Header.Get("X-Forwarded-Proto") == "https" {
		scheme = "https://"
	}
	return scheme
}

// Cookie 获取Cookie
func Cookie(c *gin.Context, name string) string {
	value, _ := c.Cookie(name)
	return value
}
