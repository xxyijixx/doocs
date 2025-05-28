package headlers

import (
	"net/http"
	"support-plugin/internal/config"
	"support-plugin/internal/pkg"

	"github.com/gin-gonic/gin"
)

type DooTaskHeadler struct {
}

var DooTask = DooTaskHeadler{}

func (d DooTaskHeadler) Chat(c *gin.Context) {
	rebot := pkg.DootaskRobot{
		Webhook: config.Cfg.DooTask.WebHook,
		Token:   config.Cfg.DooTask.Token,
		Version: config.Cfg.DooTask.Version,
	}
	message := rebot.ConvertToMessage(c)
	message.Text = "接收到信息：" + message.Text
	rebot.SendMsg()
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "服务运行正常",
	})
}
