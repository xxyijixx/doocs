package headlers

import (
	"github.com/gin-gonic/gin"
)

type AgentHeadler struct{}

var Agent = AgentHeadler{}

// @Summary 客服登录
// @Description 客服登录并获取认证令牌
// @Accept json
// @Produce json
// @Success 200 {object} models.Response{data=models.AgentLoginResponse}
// @Failure 400 {object} models.Response
// @Failure 401 {object} models.Response
// @Failure 500 {object} models.Response
// @Router /agent [get]
func (a *AgentHeadler) List(c *gin.Context) {

}

func (a *AgentHeadler) Edit(c *gin.Context) {

}
