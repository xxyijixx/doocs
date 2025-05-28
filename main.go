package main

import (
	"fmt"
	"strconv"

	"support-plugin/internal/config"
	"support-plugin/internal/middleware"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/pkg/websocket"
	"support-plugin/internal/routes"

	"github.com/gin-gonic/gin"
)

// @title Support Plugin API
// @version 1.0
// @description Support Plugin API
// @host localhost:8888
// @BasePath /api/v1
// @schemes http
func main() {
	// 初始化配置
	config.InitConfig()

	// 打印配置信息
	config.Cfg.Print()

	database.InitDB()

	// 启动WebSocket管理器
	go websocket.WebSocketManager.Start()

	// 创建Gin实例
	r := gin.Default()

	// 注册全局中间件
	middleware.RegisterGlobal(r)

	// 注册路由
	routes.RegisterRoutes(r)

	// 启动服务器
	serverAddr := fmt.Sprintf(":%d", config.Cfg.App.Port)
	fmt.Printf("服务器启动在 http://localhost:%s\n", strconv.Itoa(config.Cfg.App.Port))
	r.Run(serverAddr)
}
