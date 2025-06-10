package i18n

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// Language 支持的语言类型
type Language string

const (
	LanguageZhCN Language = "zh-CN" // 简体中文
	LanguageEnUS Language = "en-US" // 英语
	LanguageJaJP Language = "ja-JP" // 日语
)

// DefaultLanguage 默认语言
const DefaultLanguage = LanguageZhCN

// I18n 国际化管理器
type I18n struct {
	mu           sync.RWMutex
	translations map[Language]map[string]string
	defaultLang  Language
}

// Manager 全局i18n管理器实例
var Manager *I18n

// Init 初始化i18n管理器
func Init(translationsDir string) error {
	Manager = &I18n{
		translations: make(map[Language]map[string]string),
		defaultLang:  DefaultLanguage,
	}

	return Manager.LoadTranslations(translationsDir)
}

// LoadTranslations 加载翻译文件
func (i *I18n) LoadTranslations(dir string) error {
	i.mu.Lock()
	defer i.mu.Unlock()

	// 支持的语言文件
	langFiles := map[Language]string{
		LanguageZhCN: "zh-CN.json",
		LanguageEnUS: "en-US.json",
		LanguageJaJP: "ja-JP.json",
	}

	for lang, filename := range langFiles {
		filePath := filepath.Join(dir, filename)
		data, err := os.ReadFile(filePath)
		if err != nil {
			// 如果文件不存在，跳过该语言
			continue
		}

		var translations map[string]string
		if err := json.Unmarshal(data, &translations); err != nil {
			// 这是系统初始化阶段的错误，不需要国际化
			return fmt.Errorf("failed to parse translation file %s: %v", filename, err)
		}

		i.translations[lang] = translations
	}

	return nil
}

// Translate 翻译指定的键
func (i *I18n) Translate(lang Language, key string, args ...interface{}) string {
	i.mu.RLock()
	defer i.mu.RUnlock()

	// 尝试获取指定语言的翻译
	if translations, exists := i.translations[lang]; exists {
		if message, found := translations[key]; found {
			return i.formatMessage(message, args...)
		}
	}

	// 回退到默认语言
	if lang != i.defaultLang {
		if translations, exists := i.translations[i.defaultLang]; exists {
			if message, found := translations[key]; found {
				return i.formatMessage(message, args...)
			}
		}
	}

	// 如果都没找到，返回键本身
	return key
}

// formatMessage 格式化消息，支持参数替换
func (i *I18n) formatMessage(message string, args ...interface{}) string {
	if len(args) == 0 {
		return message
	}
	return fmt.Sprintf(message, args...)
}

// GetLanguageFromHeader 从HTTP头部获取语言
func GetLanguageFromHeader(acceptLanguage string) Language {
	if acceptLanguage == "" {
		return DefaultLanguage
	}

	// 解析Accept-Language头部
	languages := strings.Split(acceptLanguage, ",")
	for _, lang := range languages {
		lang = strings.TrimSpace(strings.Split(lang, ";")[0])
		switch {
		case strings.HasPrefix(lang, "zh"):
			return LanguageZhCN
		case strings.HasPrefix(lang, "en"):
			return LanguageEnUS
		case strings.HasPrefix(lang, "ja"):
			return LanguageJaJP
		}
	}

	return DefaultLanguage
}

// T 全局翻译函数
func T(lang Language, key string, args ...interface{}) string {
	if Manager == nil {
		return key
	}
	return Manager.Translate(lang, key, args...)
}