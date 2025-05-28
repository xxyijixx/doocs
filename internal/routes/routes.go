package routes

import (
	"support-plugin/internal/headlers"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(r *gin.Engine) {
	// API 路由组 v1
	v1 := r.Group("/api/v1")
	{
		// 健康检查
		v1.GET("/health", headlers.HealthCheck)

		// DooTask相关路由
		dooTaskRoutes := v1.Group("/dootask")
		{
			dooTaskRoutes.POST("/chat", headlers.DooTask.Chat)
		}
	}

	// 静态文件服务
	r.Static("/static", "./static")

	// 404处理
	// r.NoRoute(headler.NotFound)
}
