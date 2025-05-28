package routes

import (
	"support-plugin/internal/headlers"
	"support-plugin/internal/middleware"
	"support-plugin/internal/pkg/websocket"

	_ "support-plugin/docs"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(r *gin.Engine) {
	// API 路由组 v1
	v1 := r.Group("/api/v1", middleware.LoggerMiddleware(), middleware.ErrorHandlerMiddleware())
	{

		// 健康检查
		v1.GET("/health", headlers.HealthCheck)

		// DooTask相关路由
		dooTaskRoutes := v1.Group("/dootask")
		{
			dooTaskRoutes.POST("/chat", headlers.DooTask.Chat)
		}

		// 对话相关路由
		chatRoutes := v1.Group("/chat")
		{
			// 创建对话
			chatRoutes.POST("", headlers.Chat.CreateConversation)
			// 发送消息
			chatRoutes.POST("/messages", headlers.Chat.SendMessage)
			// 获取对话消息列表
			chatRoutes.GET("/:uuid/messages", headlers.Chat.GetMessages)
			// 获取对话信息
			chatRoutes.GET("/:uuid", headlers.Chat.GetConversation)
			// WebSocket连接
			chatRoutes.GET("/ws", func(c *gin.Context) {
				websocket.ServeWs(c)
			})
		}
	}
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	// 静态文件服务
	r.Static("/static", "./static")

	// 404处理
	r.NoRoute(headlers.NotFound)
}
