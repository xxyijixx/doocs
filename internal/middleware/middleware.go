package middleware

import (
	"github.com/gin-gonic/gin"
)

// RegisterGlobal 注册全局中间件
func RegisterGlobal(r *gin.Engine) {
	// 注册CORS中间件
	r.Use(CORSMiddleware())

	// 注册日志中间件
	r.Use(LoggerMiddleware())

	// 注册错误处理中间件
	r.Use(ErrorHandlerMiddleware())
}

// CORSMiddleware 处理跨域请求
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// ErrorHandlerMiddleware 错误处理中间件
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// 检查是否有错误
		if len(c.Errors) > 0 {
			c.JSON(500, gin.H{
				"code":    500,
				"message": "服务器内部错误",
				"errors":  c.Errors.Errors(),
			})
		}
	}
}
