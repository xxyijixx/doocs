# Chat Widget 集成指南

这是一个可嵌入的聊天组件，支持动态配置和多种集成方式。

## 功能特性

- 🚀 **自动配置**: 从脚本URL自动提取baseUrl和source参数
- 🔧 **灵活配置**: 支持全局配置和手动初始化
- 📱 **响应式设计**: 适配移动端和桌面端
- 🔌 **WebSocket支持**: 实时消息推送
- 🎨 **现代UI**: 美观的聊天界面

## 构建

```bash
# 安装依赖
npm install

# 构建
npm run build

# 或使用构建脚本
./build.sh
```

构建后会在 `dist/` 目录生成 `bundle.js` 文件。

## 后端集成

### 1. 嵌入到Go后端

在 `internal/web/web.go` 中已经配置了embed:

```go
//go:embed widget/dist/*
var WidgetDist embed.FS
```

### 2. 路由配置

在 `internal/routes/routes.go` 中添加了widget访问路由:

```go
// Widget脚本访问路径
r.GET("/widget/bundle.js", func(c *gin.Context) {
    file, err := web.WidgetDist.ReadFile("widget/dist/bundle.js")
    if err != nil {
        c.String(http.StatusNotFound, "Widget script not found")
        return
    }
    c.Data(http.StatusOK, "application/javascript", file)
})
```

## 使用方法

### 方式1: URL参数自动配置 (推荐)

```html
<script src="http://your-server.com/widget/bundle.js?source=your-source-key"></script>
```

**优点**: 
- 最简单的集成方式
- baseUrl自动从URL提取
- source通过URL参数传递

### 方式2: 本地应用集成 (Vue/React等)

适用于本地开发的Vue、React等应用，需要手动配置baseUrl和source:

```html
<!-- 在HTML中引入 -->
<script>
    window.WIDGET_CONFIG = {
        baseUrl: 'http://your-server.com',
        source: 'your-source-key'
    };
</script>
<script src="./path/to/bundle.js"></script>
```

或者在JavaScript中动态配置:

```javascript
// 在Vue/React组件中
import './path/to/bundle.js';

// 配置widget
window.WIDGET_CONFIG = {
    baseUrl: 'http://your-server.com',
    source: 'your-source-key'
};

// 手动初始化
if (window.SupportChatWidget) {
    window.SupportChatWidget.init({
        baseUrl: 'http://your-server.com',
        source: 'your-source-key'
    });
}
```

### 方式3: 手动初始化

```html
<script src="http://your-server.com/widget/bundle.js"></script>
<script>
    // 阻止自动初始化
    window.WIDGET_CONFIG = { autoInit: false };
    
    // 手动初始化
    SupportChatWidget.init({
        baseUrl: 'http://your-server.com',
        source: 'your-source-key'
    });
</script>
```

## 配置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| baseUrl | string | 是 | API服务器地址 |
| source | string | 是 | 来源标识，用于区分不同的接入方 |
| autoInit | boolean | 否 | 是否自动初始化，默认true |

## API接口

Widget会调用以下API接口:

- `POST /api/v1/chat` - 创建会话
- `GET /api/v1/chat/{uuid}/messages` - 获取消息列表
- `POST /api/v1/chat/messages` - 发送消息
- `WebSocket /api/v1/chat/ws` - 实时消息推送

## 访问路径示例

假设服务器地址为 `http://example.com`，source为 `demo-key`:

```
http://example.com/widget/bundle.js?source=demo-key
```

这样访问时:
- baseUrl会自动提取为: `http://example.com`
- source会设置为: `demo-key`

## 样式自定义

Widget使用内联样式，如需自定义外观，可以通过CSS覆盖:

```css
/* 修改聊天容器样式 */
#chat-widget-container {
    /* 自定义样式 */
}

/* 修改消息样式 */
#chat-widget-container .message {
    /* 自定义样式 */
}
```

## 错误处理

Widget内置了以下错误处理机制:

- 会话不存在时自动创建新会话
- 会话关闭时显示重新开始按钮
- WebSocket断线时自动重连
- 网络错误时显示友好提示

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 开发调试

开发时可以在浏览器控制台查看调试信息:

```javascript
// 查看当前配置
console.log('API_BASE_URL:', API_BASE_URL);
console.log('WIDGET_SOURCE:', WIDGET_SOURCE);

// 手动发送消息
SupportChatWidget.sendMessage(conversationUuid, 'test message');
```

## 部署注意事项

1. 确保后端API服务正常运行
2. 检查CORS配置，允许widget域名访问
3. 确保WebSocket连接正常
4. 建议启用HTTPS以支持安全的WebSocket连接

## 故障排除

### 常见问题

1. **Widget不显示**
   - 检查脚本是否正确加载
   - 查看浏览器控制台错误信息
   - 确认API服务器地址正确

2. **无法发送消息**
   - 检查网络连接
   - 确认API接口正常
   - 查看source参数是否正确

3. **WebSocket连接失败**
   - 检查服务器WebSocket支持
   - 确认防火墙设置
   - 查看协议是否匹配(http/ws, https/wss)

### 调试模式

在开发环境中，可以启用详细日志:

```javascript
window.WIDGET_CONFIG = {
    debug: true,
    baseUrl: 'http://localhost:8888',
    source: 'debug-source'
};
```