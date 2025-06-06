package initialize

import (
	"encoding/json"
	"log"
	"support-plugin/internal/models"
	"support-plugin/internal/pkg/database"
	"support-plugin/internal/utils/common"
)

// InitDefaultConfig 初始化默认配置
func InitDefaultConfig() {
	db := database.GetDB()
	var count int64
	db.Model(models.CSConfig{}).Where("key = ?", models.CSConfigKeyDooTaskChat).Count(&count)

	if count != 0 {
		log.Println("已存在默认配置")
		return
	}
	chatKey := common.RandString(32)
	chatConfig := models.DooTaskChat{
		ChatKey: chatKey,
	}
	jsonBytes, err := json.Marshal(chatConfig)
	if err!= nil {
		return	
	}
	defaultConfig := models.CSConfig{
		ConfigKey:  models.CSConfigKeyDooTaskChat,
		ConfigJSON: string(jsonBytes),
	}
	result := db.Create(&defaultConfig)
	if result.Error != nil {

		return
	}
}
