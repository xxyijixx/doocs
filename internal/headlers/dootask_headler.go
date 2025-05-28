package headlers

import (
	"support-plugin/internal/config"
	"support-plugin/internal/pkg"
	"support-plugin/internal/pkg/response"

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
	response.Success(c, "服务运行正常", gin.H{
		"status": "ok",
	})
}
