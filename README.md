# DooTask 智能客服插件

这是一个专为 DooTask 协作平台设计的智能客服插件，可通过 DooTask 应用商店安装，为团队提供完整的客服解决方案。

## 项目概览

本项目是一个深度集成 DooTask 的客服应用，包含后端服务和两个前端应用：
- **Admin 管理后台**：用于配置客服系统、管理客服人员和查看对话记录
- **Widget 客服组件**：可嵌入到网站中的客服聊天窗口

## 核心特性

### DooTask 深度集成
- 🔐 **统一身份认证**：使用 DooTask 用户体系，无需额外注册
- 👥 **用户管理同步**：直接从 DooTask 选择和管理客服人员
- 📋 **自动任务创建**：客服对话可自动在 DooTask 中创建对应任务
- 💬 **对话同步**：客服消息可同步到 DooTask 任务对话中
- 🎨 **主题适配**：自动适配 DooTask 的主题风格
- 🌐 **多语言支持**：跟随 DooTask 的语言设置

### 智能客服功能
- 💬 **实时聊天**：基于 WebSocket 的实时消息传输
- 📊 **对话管理**：完整的对话记录和统计分析
- 🔧 **灵活配置**：支持多种客服场景配置
- 📱 **响应式设计**：适配各种设备和屏幕尺寸

## 技术栈

- **后端**: Go
  - 框架: Gin (根据 `internal/headlers` 和 `internal/routes` 推断)
  - 依赖管理: `go mod`
  - 配置管理: `github.com/spf13/viper`
  - 环境变量: `github.com/joho/godotenv`
  - 数据库: (未明确，但 `internal/pkg/database` 存在)
  - WebSocket: `internal/pkg/websocket`
- **前端 (Admin)**:
  - 框架: React
  - 语言: TypeScript
  - 样式: TailwindCSS
  - UI 组件库: `@headlessui/react`
  - 图标库: `heroicons`
  - 构建工具: Vite
- **前端 (Widget)**:
  - 框架: React
  - 语言: TypeScript
  - 构建工具: Webpack

## 安装方式

### 方式一：DooTask 应用商店安装（推荐）
1. 登录 DooTask 管理后台
2. 进入应用商店
3. 搜索「智能客服」或「Support Plugin」
4. 点击安装并按提示完成配置

### 方式二：手动部署

请确保您已安装 Go、Node.js 和 npm/yarn，以及可访问的 DooTask 实例。

### 1. 后端服务

1. **安装 Go 依赖**:

   ```bash
   go mod download
   ```

   项目使用 go mod 进行依赖管理，执行上述命令会自动下载 `go.mod` 文件中定义的所有依赖。

2. **运行后端服务**:

   在项目根目录下执行：
   ```bash
   go run main.go
   ```
   或者
   ```bash
   make run
   ```
   服务通常会在 `config.yaml` 中定义的端口上启动。

### 2. 前端 Admin 应用

1. **进入 Admin 目录**:

   ```bash
   cd web/admin
   ```

2. **安装 Node.js 依赖**:

   ```bash
   npm install
   # 或者 yarn install
   ```

3. **运行开发服务器**:

   ```bash
   npm run dev
   # 或者 yarn dev
   ```
   应用通常会在 `vite.config.ts` 中配置的端口上启动。

4. **构建生产版本**:

   ```bash
   npm run build
   # 或者 yarn build
   ```

### 3. 前端 Widget 应用

1. **进入 Widget 目录**:

   ```bash
   cd web/widget
   ```

2. **安装 Node.js 依赖**:

   ```bash
   npm install
   # 或者 yarn install
   ```

3. **构建生产版本**:

   ```bash
   npm run build
   # 或者 yarn build
   ```
   构建后的文件会输出到 `dist/` 目录。

## 项目结构

```
.gitignore
.trae/               # Trae AI 相关配置
Makefile             # 构建脚本
README.md            # 项目说明文档
config.yaml          # 后端配置文件
docs/                # API 文档 (Swagger)
├── docs.go
├── swagger.json
└── swagger.yaml
go.mod               # Go 模块文件
go.sum               # Go 模块校验和文件
internal/            # 后端内部实现
├── config/          # 配置加载
├── headlers/        # HTTP 请求处理器
│   ├── dootask_headler.go    # DooTask 集成处理器
│   └── ...
├── middleware/      # 中间件 (包含 DooTask 认证)
├── models/          # 数据模型 (包含 DooTask 集成配置)
├── pkg/             # 内部包
│   ├── database/    # 数据库操作
│   ├── dootask/     # DooTask API 集成
│   ├── eventbus/    # 事件总线 (DooTask 事件处理)
│   ├── websocket/   # WebSocket 支持
│   └── ...
├── service/         # 业务逻辑服务
└── ...
main.go              # 后端入口文件
web/                 # 前端应用
├── admin/           # 管理后台 (集成 @dootask/tools)
└── widget/          # 客服聊天组件
```

## 配置说明

### DooTask 集成配置

在 `config.yaml` 中配置 DooTask 连接信息：

```yaml
app:
  mode: "dootask"  # 启用 DooTask 模式

dootask:
  url: ${DOOTASK_URL}        # DooTask 实例地址
  token: ${DOOTASK_TOKEN}    # DooTask API Token
  webhook: ${DOOTASK_WEBHOOK} # DooTask Webhook 地址
  version: ${DOOTASK_VERSION} # DooTask 版本
```

### 环境变量

```bash
DOOTASK_URL=http://your-dootask-instance
DOOTASK_TOKEN=your-api-token
DOOTASK_WEBHOOK=http://your-dootask-instance/api/dialog/msg/sendtext
DOOTASK_VERSION=1.0.0
```

## API 文档

后端 API 文档通过 Swagger 生成，可以在以下路径找到：
- <mcfile name="swagger.json" path="docs/swagger.json"></mcfile>
- <mcfile name="swagger.yaml" path="docs/swagger.yaml"></mcfile>

### 主要 API 端点

- `/api/v1/dootask/{chatKey}/chat` - DooTask 消息接收
- `/api/v1/agents` - 客服人员管理
- `/api/v1/config` - 系统配置管理
- `/api/v1/conversations` - 对话管理

## 使用指南

### 1. 安装插件后的配置
1. 在 DooTask 中打开客服插件
2. 配置机器人和项目集成
3. 设置客服人员（从 DooTask 用户中选择）
4. 配置自动任务创建等功能

### 2. 嵌入客服组件
将生成的客服组件代码嵌入到您的网站中：

```html
<script src="/path/to/widget.js"></script>
<div id="customer-service-widget"></div>
```

### 3. DooTask 集成功能
- **自动任务创建**：新的客服对话会自动在指定项目中创建任务
- **消息同步**：客服消息会同步到对应的任务对话中
- **用户权限**：基于 DooTask 的用户权限体系

## Docker 部署

```bash
# 使用 docker-compose
docker-compose up -d

# 或使用预构建镜像
docker run -d \
  -e DOOTASK_URL=http://your-dootask \
  -e DOOTASK_TOKEN=your-token \
  -p 8080:8080 \
  your-registry/dootask-app-cs:latest
```

## 贡献

欢迎对本项目做出贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/YourFeatureName`)
3. 提交您的更改 (`git commit -m 'Add some YourFeatureName'`)
4. 推送到分支 (`git push origin feature/YourFeatureName`)
5. 提交 Pull Request

在提交之前，请确保您的代码通过了所有测试，并遵循项目编码规范。

## 许可证

