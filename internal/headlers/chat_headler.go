package headlers

// 注意：此文件中的方法已经分离到以下文件：
// - chat_public_headler.go: 处理公共端（客户端）的业务逻辑
// - chat_agent_headler.go: 处理客服端的业务逻辑
//
// 如果需要保持向后兼容性，可以在这里保留原有的ChatHeadler结构
// 并将方法调用委托给新的分离后的handler

type ChatHeadler struct {
}

var Chat = ChatHeadler{}

// 此文件已被重构，所有方法已分离到：
// - ChatPublic: 公共端handler
// - ChatAgent: 客服端handler
