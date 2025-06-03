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

		// 认证相关路由
		authRoutes := v1.Group("/auth")
		{
			// 客服登录
			authRoutes.POST("/login", headlers.Auth.Login)

			// 需要认证的路由
			authProtected := authRoutes.Group("", middleware.AgentAuthMiddleware())
			{
				// 获取当前客服信息
				authProtected.GET("/me", headlers.Auth.GetCurrentAgent)
				// 创建客服账号
				authProtected.POST("/agents", headlers.Auth.CreateAgent)
			}
		}

		// 配置相关路由
		configRoutes := v1.Group("/configs")
		{
			// 获取所有配置
			configRoutes.GET("", headlers.Config.GetAllConfigs)
			// 获取指定配置
			configRoutes.GET("/:config_key", headlers.Config.GetConfig)
			// 保存配置
			configRoutes.POST("/:config_key", headlers.Config.SaveConfig)
			// 删除配置
			configRoutes.DELETE("/:config_key", headlers.Config.DeleteConfig)
		}

		// 客服来源相关路由
		sourceRoutes := v1.Group("/sources")
		{
			// 创建来源
			sourceRoutes.POST("", headlers.Source.CreateSource)
			// 获取所有来源
			sourceRoutes.GET("", headlers.Source.GetSourceList)
			// 根据ID获取来源
			sourceRoutes.GET("/:id", headlers.Source.GetSourceById)
			// 更新来源
			sourceRoutes.PUT("/:id", headlers.Source.UpdateSource)
			// 删除来源
			sourceRoutes.DELETE("/:id", headlers.Source.DeleteSource)
		}

		// 对话相关路由
		chatRoutes := v1.Group("/chat")
		{
			// 公共路由 - 客户可访问
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

			// 需要客服认证的路由
			chatProtected := chatRoutes.Group("/agent", middleware.AgentAuthMiddleware())
			{
				// 获取客服的所有对话
				chatProtected.GET("/conversations", headlers.Chat.GetAgentConversations)
				// 根据UUID获取对话信息
				chatRoutes.GET("/conversations/:uuid", headlers.Chat.GetConversationByUUID)
				// 关闭对话
				chatProtected.PUT("/:uuid/close", headlers.Chat.CloseConversation)
			}
		}
	}
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	// 静态文件服务
	r.Static("/static", "./static")

	// 404处理
	r.NoRoute(headlers.NotFound)
}
