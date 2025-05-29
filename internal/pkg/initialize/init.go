package initialize

import (
	"log"
)

// Init 执行所有初始化操作
func Init() {
	log.Println("开始执行初始化操作...")

	// 初始化默认客服账号
	InitDefaultAgent()

	log.Println("初始化操作完成")
}
