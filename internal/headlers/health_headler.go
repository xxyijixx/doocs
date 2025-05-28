package headlers

import (
	"net/http"

	"support-plugin/internal/config"

	"github.com/gin-gonic/gin"
)

// HealthCheck 健康检查接口
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "服务运行正常",
		"app": gin.H{
			"name":    config.Cfg.App.Name,
			"version": config.Cfg.DooTask.Version,
		},
	})
}

// NotFound 404处理
func NotFound(c *gin.Context) {
	c.JSON(http.StatusNotFound, gin.H{
		"code":    404,
		"message": "请求的资源不存在",
	})
}
