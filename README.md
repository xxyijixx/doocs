# Support Plugin

这是一个支持插件项目，旨在提供智能客服和任务管理功能。

## 项目概览

本项目包含一个后端服务和两个前端应用（Admin 和 Widget），分别用于管理和展示智能客服功能。

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

## 安装与运行

请确保您已安装 Go、Node.js 和 npm/yarn。

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
Makefile             # 构建脚本 (如果存在)
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
├── middleware/      # 中间件
├── models/          # 数据模型
├── pkg/             # 内部包 (数据库、DooTask、初始化、日志、响应、WebSocket)
├── request/         # 请求结构体
├── response/        # 响应结构体
├── routes/          # 路由定义
└── service/         # 业务逻辑服务
main.go              # 后端入口文件
web/                 # 前端应用
├── admin/           # 管理后台应用
└── widget/          # 嵌入式小部件应用
```

## API 文档

后端 API 文档通过 Swagger 生成，可以在以下路径找到：
- <mcfile name="swagger.json" path="docs/swagger.json"></mcfile>
- <mcfile name="swagger.yaml" path="docs/swagger.yaml"></mcfile>

## 贡献

欢迎对本项目做出贡献！请遵循以下步骤：

1. Fork 本仓库。
2. 创建您的功能分支 (`git checkout -b feature/YourFeatureName`)。
3. 提交您的更改 (`git commit -m 'Add some YourFeatureName'`)。
4. 推送到分支 (`git push origin feature/YourFeatureName`)。
5. 提交 Pull Request。

在提交之前，请确保您的代码通过了所有测试，并遵循项目编码规范。