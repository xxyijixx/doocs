# 事件总线系统 (EventBus)

## 概述

事件总线系统是一个轻量级的异步事件处理框架，用于解耦业务逻辑和外部服务集成。通过事件驱动的架构，可以将耗时的操作（如DooTask资源创建）从主业务流程中分离出来，提高系统的响应性和可维护性。

## 架构设计

### 核心组件

1. **EventBus**: 事件总线核心，负责事件的发布、订阅和分发
2. **Event**: 事件接口，定义了事件的基本结构
3. **EventHandler**: 事件处理器，处理特定类型的事件
4. **Worker**: 工作协程，并发处理事件队列中的事件

### 工作流程

```
[业务代码] -> [发布事件] -> [事件队列] -> [Worker协程] -> [事件处理器]
```

## 文件结构

```
internal/pkg/eventbus/
├── eventbus.go        # 事件总线核心实现
├── dootask_events.go  # DooTask相关事件定义和处理器
├── init.go           # 初始化和配置
├── example.go        # 使用示例
└── README.md         # 文档说明
```

## 快速开始

### 1. 初始化事件总线

在应用启动时初始化事件总线：

```go
// 在main.go中
eventbus.InitEventBus()
eventbus.RegisterAllEventHandlers()
```

### 2. 发布事件

在业务代码中发布事件：

```go
// 在chat.go的CreateConversationWithDetails方法中
if eventbus.GlobalEventBus != nil {
    event := eventbus.NewConversationCreatedEvent(conversation, source)
    if err := eventbus.GlobalEventBus.Publish(event); err != nil {
        logger.Error("发布对话创建事件失败", "error", err)
    }
}
```

### 3. 自定义事件处理器

```go
// 注册自定义处理器
eventbus.GlobalEventBus.Subscribe("custom.event", func(ctx context.Context, event eventbus.Event) error {
    // 处理逻辑
    return nil
})
```

## DooTask集成

### 支持的事件类型

1. **ConversationCreatedEvent**: 对话创建事件
   - 触发时机：成功创建对话后
   - 处理逻辑：自动创建对应的DooTask项目和任务

2. **DooTaskTaskCreateEvent**: DooTask任务创建事件
   - 触发时机：需要创建DooTask任务时
   - 处理逻辑：调用DooTask API创建任务

3. **DooTaskDialogOpenEvent**: DooTask对话框打开事件
   - 触发时机：需要打开DooTask任务对话框时
   - 处理逻辑：调用DooTask API打开对话框

### 事件处理流程

```
对话创建 -> ConversationCreatedEvent -> DooTask处理器 -> 创建项目/任务
```

## 配置选项

### 事件总线配置

```go
// 默认配置
const (
    DefaultWorkerCount = 5    // 工作协程数量
    DefaultQueueSize   = 1000 // 事件队列大小
)

// 自定义配置
eventBus := eventbus.NewEventBus(workerCount, queueSize)
```

### DooTask配置

DooTask相关配置通过环境变量或配置文件设置：

- DooTask API地址
- 认证信息
- 项目配置

## 错误处理

### 事件处理失败

- 事件处理器返回错误时，会记录日志但不会影响其他处理器
- 支持多个处理器订阅同一事件类型
- 处理器执行是并发的，互不影响

### 事件发布失败

- 事件队列满时，发布会失败
- 事件总线未初始化时，发布会失败
- 建议在业务代码中添加适当的错误处理

## 性能考虑

### 并发处理

- 使用多个Worker协程并发处理事件
- 事件处理是异步的，不会阻塞主业务流程
- 支持背压控制，防止内存溢出

### 内存管理

- 事件队列有大小限制，防止无限增长
- 事件处理完成后会自动清理
- 支持优雅关闭，确保所有事件都被处理

## 监控和调试

### 日志记录

- 事件发布和处理都有详细的日志记录
- 支持不同级别的日志输出
- 错误信息包含事件类型和详细错误描述

### 调试工具

- 提供示例代码用于测试
- 支持事件处理统计
- 可以通过日志追踪事件处理流程

## 扩展指南

### 添加新的事件类型

1. 定义事件结构体，实现Event接口
2. 创建事件构造函数
3. 实现事件处理器
4. 在初始化时注册处理器

### 集成其他外部服务

1. 参考DooTask集成方式
2. 定义服务特定的事件类型
3. 实现对应的处理器
4. 添加必要的配置和错误处理

## 最佳实践

1. **事件设计**：保持事件数据结构简单，避免包含大量数据
2. **处理器设计**：保持处理器逻辑简单，避免长时间阻塞
3. **错误处理**：在处理器中添加适当的错误处理和重试逻辑
4. **监控**：添加必要的日志和监控，便于问题排查
5. **测试**：为事件处理器编写单元测试

## 故障排除

### 常见问题

1. **事件未被处理**：检查事件总线是否已初始化，处理器是否已注册
2. **处理器执行失败**：查看日志中的错误信息，检查外部服务连接
3. **性能问题**：调整Worker数量和队列大小，优化处理器逻辑

### 调试步骤

1. 检查事件总线初始化状态
2. 验证事件发布是否成功
3. 查看处理器注册情况
4. 分析日志中的错误信息
5. 测试外部服务连接