package models

import (
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

const (
	CSConfigKeyWelcome = "welcome_config"
	CSConfigKeyDooTask = "dootask_config"
	CSConfigKeyOther   = "other_config"
	// 后续扩展可统一添加
)

type CSConfig struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ConfigKey  string    `gorm:"column:config_key" json:"config_key"`
	ConfigJSON string    `gorm:"column:config_json" json:"config_json"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updated_at"`
}

// TableName 指定表名
func (m *CSConfig) TableName() string {
	return "cs_config"
}

// config_key = welcome_config
type WelcomeConfig struct {
	Enabled      bool   `json:"enabled"`
	Text         string `json:"text"`
	ShowDelaySec int    `json:"show_delay_sec"`
}

// config_key = dootask_config
type DooTaskConfig struct {
	Token   string `json:"token" default:""`
	Version string `json:"version" default:"1.0.0"`
	WebHook string `json:"webhook" default:""`
}

var ConfigTypeRegistry = map[string]func() interface{}{
	CSConfigKeyWelcome: func() interface{} { return &WelcomeConfig{} },
	CSConfigKeyDooTask: func() interface{} { return &DooTaskConfig{} },
}

func LoadConfig[T any](db *gorm.DB, key string) (*T, error) {
	var cfg CSConfig
	if err := db.First(&cfg, "config_key = ?", key).Error; err != nil {
		return nil, err
	}

	constructor, ok := ConfigTypeRegistry[key]
	if !ok {
		return nil, fmt.Errorf("unregistered config key: %s", key)
	}

	target := constructor()
	if err := json.Unmarshal([]byte(cfg.ConfigJSON), target); err != nil {
		return nil, err
	}

	result, ok := target.(*T)
	if !ok {
		// 实际使用泛型时，这一步通常可以省略，除非你从 map 拿出来后还需转类型
		casted := any(target).(*T)
		return casted, nil
	}

	return result, nil
}
