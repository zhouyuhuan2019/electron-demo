# Electron Demo

基于 **Electron 33 + Vue 3 + Element Plus + TypeScript** 的桌面应用开发模板 / 案例项目。

内置 **Electron 常用 API 交互手册**（22 个可点击运行的真实示例）和 6 个开箱即用的功能模块，可作为学习参考或新项目脚手架直接复用。

## 功能特性

| 模块 | 说明 |
|---|---|
| 首页 Dashboard | 技术栈展示、功能入口矩阵、快速开始指引 |
| Electron API 手册 | 15 个分类 40+ API 条目，文档站式三栏布局，支持搜索、代码复制、**可交互示例**（点击即真实调用主进程 API） |
| 系统信息 | 版本、CPU / 内存、应用路径、屏幕与鼠标坐标 |
| 文件管理 | 目录浏览、双击进入子目录、文本文件预览 |
| 网络请求 | 基于 `net` 模块（Chromium 网络栈）的接口测试工具，支持 GET/POST/PUT/DELETE + 历史记录 |
| 全局快捷键 | 注册/注销系统级快捷键，实时显示触发次数 |
| 托盘与通知 | 系统托盘创建/销毁、原生通知发送 |

## 技术栈

- **桌面框架**：Electron 33 + [electron-vite](https://electron-vite.org/)（主进程 / preload / 渲染进程三端构建）
- **前端**：Vue 3.5（Composition API）+ Element Plus 2.8 + Pinia + vue-router（Hash 模式）
- **语言**：TypeScript（node / web 双 tsconfig）
- **样式**：SCSS，BEM 命名约定

## 快速开始

> Node.js 建议 18+，推荐使用 nvm 切换版本。

```bash
# 切换 Node 版本（已安装 nvm 的话）
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20

# 安装依赖（已配置国内镜像）
npm install

# 开发模式（自动打开 DevTools，支持热更新）
npm run dev
```

## 常用命令

```bash
npm run dev        # 开发模式
npm run build      # 构建生产版本（输出到 out/）
npm run build:mac  # 打包 macOS 应用
npm run build:win  # 打包 Windows 应用
```

## 目录结构

```
consum-electron/
├── electron/
│   ├── main/
│   │   ├── index.ts          # 主进程入口：窗口创建 + 各功能模块 IPC handlers
│   │   └── demos.ts          # API 手册交互示例的 IPC handlers（demo: 前缀）
│   └── preload/
│       └── index.ts          # 预加载脚本（contextBridge 安全桥接）
├── src/
│   ├── views/                # 页面
│   │   ├── HomeView.vue          # 首页 Dashboard
│   │   ├── ElectronApiView.vue   # API 手册（三栏文档布局）
│   │   ├── SystemInfoView.vue    # 系统信息
│   │   ├── FileManagerView.vue   # 文件管理
│   │   ├── NetworkView.vue       # 网络请求
│   │   ├── ShortcutView.vue      # 全局快捷键
│   │   └── TrayView.vue          # 托盘与通知
│   ├── components/
│   │   └── ApiDemo.vue           # 通用交互示例组件（按钮 + 结果展示）
│   ├── data/electron-apis/   # API 手册数据（数据驱动，每分类一个文件）
│   │   ├── types.ts              # ApiItem / ApiCategory 类型定义
│   │   ├── index.ts              # 汇总导出
│   │   └── app.ts / ipc.ts / ... # 15 个分类数据文件
│   ├── demo/api-demos.ts     # 交互示例渲染端定义（demo key → 动作列表）
│   ├── composables/          # 组合式函数（搜索逻辑等）
│   ├── router/               # vue-router 配置
│   └── styles/               # 全局 SCSS
├── src/renderer/index.html   # 渲染进程入口 HTML（electron-vite 约定）
└── electron.vite.config.ts   # 三端构建配置
```

## 扩展指南

### 新增一个 API 手册条目

1. 在 `src/data/electron-apis/` 对应分类文件中添加条目（`name` / `desc` / `code`）
2. 如需可交互示例：
   - 在 `electron/main/demos.ts` 注册 `demo:xxx` handler
   - 在 `src/demo/api-demos.ts` 添加 demo 定义（标题 + 动作按钮）
   - 条目上加 `demo: 'xxx'` 字段，页面自动渲染交互区

### 新增一个功能模块

1. 在 `electron/main/index.ts` 注册 `模块:动作` 格式的 IPC handler
2. 在 `src/views/` 创建页面，通过 `window.ipcRenderer.invoke()` 调用
3. 在 `src/router/index.ts` 注册路由（懒加载）
4. 在首页 `HomeView.vue` 的 `features` 数组中添加入口卡片

## 安全约定

- `contextIsolation: true` + `nodeIntegration: false`
- preload 通过 `contextBridge` 仅暴露白名单 `ipcRenderer` 方法
- 外链统一走 `setWindowOpenHandler` 拦截，由系统浏览器打开
- 已开启单实例锁，二次启动聚焦已有窗口

## 环境说明

项目已配置国内镜像加速：

- npm registry：`https://registry.npmmirror.com`
- Electron 二进制：`https://npmmirror.com/mirrors/electron/`
