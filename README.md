# 一步 / Yibu

一步是一个单用户、本地优先的桌面任务工作台。产品中文名为“一步”，应用内部品牌使用英文 `Yibu`。它把 Today、Projects、任务推进和报告复盘放在一个安静的个人桌面里，视觉方向参考 Apple 式极简、Linear 式清晰和 Notion 式阅读舒适度。

## 功能概览

- 首页：查看 Today 和 Projects，快速进入项目工作区。
- 项目工作区：左侧项目导航，右侧三列任务状态，支持创建、编辑、推进、完成、撤回和加入焦点。
- 任务详情：编辑任务正文、清单、状态和优先级。
- 报告中心：按日期范围收集已完成任务，调用配置好的 AI API 生成日报/周报草稿，并支持多模型对比。
- 设置：管理主题、列色、AI API、AI 角色、数据导入导出。
- 全局反馈：保存、删除、完成、导入等动作统一使用右上角轻量提示卡片。

## 技术栈

- React 19
- TypeScript
- Vite
- Zustand
- IndexedDB + idb（Web 开发态）
- Tauri 2 + SQLite（桌面端）
- Vitest + Testing Library

## 快速开始

建议使用 Node.js 20.19+。

```bash
npm install
npm run dev
```

打开开发服务后访问：

```text
http://localhost:5173/
```

## 桌面开发

Tauri 开发模式：

```bash
npm run tauri:dev
```

打包 macOS 桌面应用：

```bash
npm run tauri:build
```

当前构建产物会输出到：

```text
/tmp/yibu-tauri-target/release/bundle/macos/一步.app
/tmp/yibu-tauri-target/release/bundle/dmg/一步_0.1.0_aarch64.dmg
```

## 常用命令

```bash
npm run dev      # 启动开发服务
npm run check    # TypeScript 类型检查
npm test         # 运行测试
npm run build    # 类型检查并构建生产包
npm run preview  # 预览生产构建
npm run tauri:dev    # 启动 Tauri 桌面开发模式
npm run tauri:build  # 构建 Tauri 桌面包
```

## 数据持久化

应用是本地优先设计，不会把用户数据提交进仓库。

- Web 开发态默认使用浏览器 IndexedDB 保存项目、任务、焦点、报告和设置。
- 桌面端使用 Tauri SQLite，数据库为 `yibu.db`。
- 正式桌面包首次启动为空数据，不会内置 demo 项目、任务或报告。

开发环境额外启用了本地快照同步：

```text
.local-data/app-snapshot.json
```

这个文件用于把浏览器数据同步到本地磁盘，方便本机开发时长期保留数据。`.local-data` 已加入 `.gitignore`，不会提交到仓库。

设置页也提供导入/导出功能，可以把完整数据快照保存为 JSON，或从 JSON 恢复。

## AI 报告配置

报告中心依赖设置页里的 AI API Profile。每个 Profile 包含：

- API endpoint
- API key
- model
- provider preset

开发环境通过 Vite 中间件代理 `/api/ai/chat-completions` 和 `/api/ai/models`，用于调用兼容 OpenAI Chat Completions 格式的模型服务。内置预设包含 DeepSeek、Kimi、智谱和 Custom。

## 项目结构

```text
src/
  app/                 # 应用壳、路由、启动加载
  components/          # 通用 UI、任务、项目、焦点组件
  features/            # 首页、项目、任务、报告、设置等业务模块
  lib/                 # 存储、导入导出、AI、local persistence、桌面适配
  styles/              # 全局样式和视觉系统实现
  tests/               # 单元测试和组件测试
  types/               # 领域类型
src-tauri/
  capabilities/        # Tauri 权限配置
  icons/               # 桌面应用图标资源
  src/                 # Tauri 启动和 SQLite migration
```

设计方向见 [DESIGN.md](./DESIGN.md)。

## 开发约定

- 保持本地优先，不把用户数据提交进仓库。
- 正式包不能自动写入 demo/original 数据；演示数据只允许用于开发态或显式测试。
- 纯图标按钮必须有清晰的 `aria-label` 和短 tooltip。
- 用户反馈统一使用右上角 Toast。
- 修改数据状态时，需要同步触发本地快照保存。
- 新增核心行为时补充测试，至少运行 `npm run check` 和相关测试。
