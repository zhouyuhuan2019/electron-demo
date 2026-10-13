/**
 * ============================================================
 * Electron 常用 API 参考手册（示例代码 + 中文注释）
 * ============================================================
 *
 * Electron 进程模型：
 *  - 主进程（Main）       ：Node.js 环境，管理窗口、系统资源、应用生命周期，全局只有一个。
 *  - 渲染进程（Renderer） ：Chromium 环境，运行页面 UI（本项目即 Vue 应用）。
 *  - 预加载脚本（Preload） ：桥梁进程，通过 contextBridge 安全地把能力暴露给渲染进程。
 *
 * 注意：本文件仅作为 API 速查参考，不参与项目构建。
 */

// ============================ 1. app 应用生命周期 ============================

import { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } from 'electron'

// app.whenReady()：等待 Electron 初始化完成，所有主进程逻辑从这里开始
app.whenReady().then(() => {
  console.log('应用初始化完成')
})

// app.on('window-all-closed')：所有窗口关闭时触发（macOS 上一般不退出，保留 Dock 激活行为）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// app.quit()：退出应用（会依次触发 before-quit → will-quit → quit）
// app.exit(code)：立即强制退出，不触发事件
// app.relaunch()：重启应用（需配合 quit 使用）
// app.isPackaged：是否为打包后的生产环境（开发时为 false）
// app.getVersion()：读取 package.json 中的版本号
// app.getPath(name)：获取系统路径，常用 'userData' | 'temp' | 'downloads' | 'documents' | 'exe'
// app.setLoginItemSettings：设置开机自启
// app.requestSingleInstanceLock()：单实例锁，防止多开（配合 second-instance 事件）
// app.disableHardwareAcceleration()：关闭 GPU 加速（兼容老系统/虚拟机时使用）

// ============================ 2. BrowserWindow 窗口管理 ============================

function windowApi() {
  // 创建窗口：options 控制尺寸、边框、透明度等
  const win = new BrowserWindow({
    width: 1200, // 初始宽度
    height: 800, // 初始高度
    minWidth: 800, // 最小宽度
    minHeight: 600, // 最小高度
    show: false, // 先隐藏，等 ready-to-show 后再显示，避免白屏闪烁
    frame: true, // 是否显示原生边框（false 为无边框窗口，可自定义标题栏）
    transparent: false, // 是否透明背景（需配合 frame: false）
    titleBarStyle: 'default', // macOS 标题栏样式：'hidden' | 'hiddenInset'
    resizable: true, // 是否可调整大小
    maximizable: true, // 是否可最大化
    fullscreenable: true, // 是否可全屏
    alwaysOnTop: false, // 是否置顶
    autoHideMenuBar: true, // 自动隐藏菜单栏（按 Alt 唤出）
    webPreferences: {
      preload: '', // 预加载脚本路径
      contextIsolation: true, // 上下文隔离（安全必开）
      nodeIntegration: false, // 渲染进程不集成 Node（安全必关）
      webSecurity: true, // 同源策略
      devTools: true // 是否允许打开 DevTools
    }
  })

  // 加载页面：开发环境加载 dev-server，生产环境加载本地文件
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL) // 加载远程 URL
  } else {
    win.loadFile('out/renderer/index.html') // 加载本地 HTML
  }

  // 窗口显示/隐藏/关闭
  win.once('ready-to-show', () => win.show()) // 首次渲染完成后显示
  win.hide() // 隐藏（常用于"点关闭最小化到托盘"）
  win.close() // 关闭（可被 close 事件拦截）
  win.destroy() // 强制销毁，不触发事件

  // 窗口状态控制
  win.minimize() // 最小化
  win.maximize() // 最大化
  win.unmaximize() // 取消最大化
  win.restore() // 还原
  win.isMaximized() // 是否最大化
  win.isMinimized() // 是否最小化
  win.focus() // 聚焦窗口
  win.setAlwaysOnTop(true) // 窗口置顶
  win.setFullScreen(true) // 全屏
  win.setProgressBar(0.5) // 任务栏进度条（0~1，下载类应用常用）
  win.flashFrame(true) // 任务栏闪烁提醒（Windows）
  win.setTitle('新标题') // 设置标题
  win.getBounds() // 获取窗口位置尺寸 { x, y, width, height }
  win.setBounds({ x: 100, y: 100, width: 800, height: 600 }) // 设置窗口位置尺寸
  win.center() // 窗口居中

  // 常用窗口事件
  win.on('resize', () => {}) // 尺寸变化
  win.on('move', () => {}) // 位置移动
  win.on('focus', () => {}) // 获得焦点
  win.on('blur', () => {}) // 失去焦点
  win.on('maximize', () => {}) // 最大化
  win.on('unmaximize', () => {}) // 取消最大化
  win.on('enter-full-screen', () => {}) // 进入全屏
  win.on('leave-full-screen', () => {}) // 退出全屏
  win.on('close', (e) => {
    // 拦截关闭：例如确认退出、或隐藏到托盘
    // e.preventDefault() 可以阻止关闭
  })
  win.on('closed', () => {}) // 已关闭（窗口对象释放，适合置 null）

  return win
}

// ============================ 3. ipcMain / ipcRenderer 进程通信 ============================

/**
 * 通信三种模式：
 *  ① 渲染 → 主（请求-响应）：renderer 调 ipcRenderer.invoke()，主进程 ipcMain.handle()
 *  ② 渲染 → 主（单向）：renderer 调 ipcRenderer.send()，主进程 ipcMain.on()
 *  ③ 主 → 渲染（推送）：主进程 win.webContents.send()，renderer 调 ipcRenderer.on()
 */

// —— 主进程侧 ——
ipcMain.handle('user:get-info', async (_event, userId: number) => {
  // invoke/handle 模式：支持返回 Promise，渲染进程 await 拿结果（推荐）
  return { id: userId, name: '张三' }
})

ipcMain.on('log:write', (_event, msg: string) => {
  // send/on 模式：单向通信，无返回值
  console.log('渲染进程消息:', msg)
})

// 主进程主动推送消息到渲染进程
function pushToRenderer(win: BrowserWindow) {
  win.webContents.send('task:progress', { id: 1, percent: 80 })
}

// —— 渲染进程侧（需先在 preload 中通过 contextBridge 暴露，见第 14 节）——
// const info = await window.electronAPI.getUserInfo(1)       // 对应 handle
// window.electronAPI.sendLog('hello')                        // 对应 on
// window.electronAPI.onTaskProgress((data) => { ... })       // 对应 send 推送

// ============================ 4. dialog 原生对话框 ============================

async function dialogApi(win: BrowserWindow) {
  // 打开文件选择框（可多选、过滤类型）
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: '选择文件',
    defaultPath: app.getPath('documents'), // 默认打开目录
    properties: ['openFile', 'multiSelections'], // openFile 单文件 / openDirectory 选目录 / multiSelections 多选
    filters: [
      { name: '图片', extensions: ['jpg', 'png', 'gif'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })
  if (!canceled) console.log('选中文件:', filePaths)

  // 打开保存文件框
  const { filePath: savePath } = await dialog.showSaveDialog(win, {
    title: '保存文件',
    defaultPath: '导出数据.xlsx',
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })
  console.log('保存路径:', savePath)

  // 消息提示框（替代 alert，模态交互）
  const { response } = await dialog.showMessageBox(win, {
    type: 'warning', // 'none' | 'info' | 'error' | 'question' | 'warning'
    title: '提示',
    message: '确定要删除这条记录吗？',
    detail: '删除后不可恢复',
    buttons: ['取消', '确定'], // 返回值为按钮索引
    defaultId: 1, // 默认按钮
    cancelId: 0 // Esc 对应按钮
  })
  return response === 1 // true 表示点了"确定"
}

// ============================ 5. Menu 应用菜单 / 右键菜单 ============================

function menuApi(win: BrowserWindow) {
  // 应用顶部菜单（macOS 顶部栏 / Windows、Linux 窗口菜单栏）
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => console.log('新建') },
        { type: 'separator' }, // 分隔线
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: () => dialog.showOpenDialog(win, { properties: ['openFile'] })
        },
        { role: 'quit', label: '退出' } // role 是内置行为：quit/copy/paste/reload/undo...
      ]
    },
    {
      label: '编辑',
      role: 'editMenu' // 预设的编辑菜单（复制、粘贴等，macOS 必备，否则快捷键失效）
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' }, // 刷新
        { role: 'toggleDevTools' }, // 开关 DevTools
        { type: 'separator' },
        { role: 'resetZoom' }, // 重置缩放
        { role: 'zoomIn' }, // 放大
        { role: 'zoomOut' } // 缩小
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  // 右键菜单（一般由渲染进程触发 ipc 调用）
  const contextMenu = Menu.buildFromTemplate([
    { label: '复制', role: 'copy' },
    { label: '粘贴', role: 'paste' },
    { type: 'separator' },
    { label: '自定义操作', click: () => console.log('自定义操作') }
  ])
  // contextMenu.popup({ window: win }) // 在鼠标位置弹出
}

// ============================ 6. Tray 系统托盘 ============================

function trayApi(win: BrowserWindow) {
  // 创建托盘图标（注意打包后 icon 必须用绝对路径，建议放 resources 目录）
  const tray = new Tray(nativeImage.createFromPath('resources/icon.png'))

  tray.setToolTip('Consum Electron') // 悬停提示
  tray.setTitle('标题') // macOS 托盘旁文字

  // 托盘右键菜单
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '显示主窗口', click: () => win.show() },
      { label: '设置', click: () => console.log('打开设置') },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() }
    ])
  )

  // 托盘事件
  tray.on('click', () => win.show()) // 单击（macOS）；Windows 上单击默认打开右键菜单
  tray.on('double-click', () => win.show()) // 双击（Windows 常用）

  // 动态切换托盘图标（如"在线/离线"状态）
  // tray.setImage(nativeImage.createFromPath('resources/icon-offline.png'))
}

// ============================ 7. Notification 系统通知 ============================

function notificationApi() {
  // 发送系统原生通知（需 Windows 下先 app.setAppUserModelId）
  const notification = new Notification({
    title: '下载完成',
    body: '文件 xxx.zip 已下载完成，点击查看',
    icon: nativeImage.createFromPath('resources/icon.png'),
    silent: false // 是否静默
  })

  notification.on('click', () => {
    console.log('用户点击了通知') // 一般在此唤起/聚焦窗口
  })
  notification.show()
}

// ============================ 8. globalShortcut 全局快捷键 ============================

// 即使应用不在前台，快捷键也能触发（如截图、录屏类应用）
// import { globalShortcut } from 'electron'
// globalShortcut.register('CommandOrControl+Shift+X', () => { ... })  // CommandOrControl: mac 是 Cmd，win/linux 是 Ctrl
// globalShortcut.isRegistered('CommandOrControl+Shift+X')             // 是否已被注册（可能被其他应用占用）
// globalShortcut.unregister('CommandOrControl+Shift+X')               // 注销单个
// globalShortcut.unregisterAll()                                      // 应用退出前注销全部

// ============================ 9. clipboard 剪贴板 ============================

// import { clipboard } from 'electron'
// clipboard.writeText('复制的文本')        // 写入文本
// clipboard.readText()                    // 读取文本
// clipboard.writeImage(nativeImage)       // 写入图片
// clipboard.readImage()                   // 读取图片
// clipboard.clear()                       // 清空
// clipboard.availableFormats()            // 可用数据格式 ['text/plain', 'image/png' ...]
// clipboard.write({ text: '', html: '' }) // 同时写入多种格式

// ============================ 10. screen 屏幕信息 ============================

// import { screen } from 'electron'   // 注意：screen 在 app ready 之后才能使用
// screen.getPrimaryDisplay()          // 主屏幕（含 workArea 工作区、size、scaleFactor 缩放比）
// screen.getAllDisplays()             // 所有显示器（多屏开发必备）
// screen.getCursorScreenPoint()       // 鼠标当前坐标（实现"窗口跟随鼠标"弹窗）
// screen.getDisplayNearestPoint({ x, y }) // 距离某坐标最近的屏幕
// screen.on('display-added', () => {})    // 接入新显示器
// screen.on('display-removed', () => {})  // 移除显示器

// ============================ 11. shell 系统交互 ============================

// import { shell } from 'electron'
// shell.openExternal('https://electronjs.org')  // 用系统默认浏览器打开链接（窗口内点击外链时的标准做法）
// shell.openPath('/Users/xx/file.pdf')          // 用系统默认程序打开文件
// shell.showItemInFolder('/Users/xx/file.pdf')  // 在文件夹中显示该文件（下载完成后常用）
// shell.trashItem('/path/to/file')              // 移到系统回收站
// shell.beep()                                  // 系统提示音

// ============================ 12. session 会话 / Cookie / 下载 ============================

// import { session } from 'electron'
// session.defaultSession                                    // 默认会话
// session.fromPartition('persist:part1')                    // 独立会话（多账号隔离场景）
// session.defaultSession.cookies.get({})                    // 读 Cookie
// session.defaultSession.cookies.set({ url, name, value })  // 写 Cookie
// session.defaultSession.cookies.remove(url, name)          // 删 Cookie
// session.defaultSession.clearCache()                       // 清缓存
// session.defaultSession.clearStorageData()                 // 清 localStorage / Cookie 等存储
// session.defaultSession.setUserAgent('...')                // 修改 UA
// session.defaultSession.setProxy({ mode: 'system' })       // 设置代理
// session.defaultSession.setUserAgent('...')                // 伪装 UA（爬虫/兼容场景）

// 拦截下载行为：把文件保存到指定目录、监听进度
// session.defaultSession.on('will-download', (event, item, webContents) => {
//   item.setSavePath('/Users/xx/downloads/file.zip')   // 指定保存路径，跳过另存为弹窗
//   item.on('updated', (_e, state) => {
//     console.log('进度:', item.getReceivedBytes() / item.getTotalBytes())
//   })
//   item.once('done', (_e, state) => {
//     console.log(state === 'completed' ? '下载完成' : '下载中断')
//   })
// })

// ============================ 13. webContents 网页内容控制 ============================

function webContentsApi(win: BrowserWindow) {
  const wc = win.webContents // 每个窗口自带一个 webContents 实例

  // 页面加载
  wc.loadURL('https://example.com') // 加载网页
  wc.reload() // 重新加载
  wc.stop() // 停止加载
  wc.openDevTools({ mode: 'detach' }) // 打开 DevTools（detach 独立窗口）
  wc.closeDevTools() // 关闭 DevTools

  // 与页面交互
  wc.send('main:message', { hello: 'world' }) // 主进程 → 渲染进程 推送
  wc.executeJavaScript('document.title') // 在页面里执行 JS 并拿到返回值
  wc.capturePage().then((img) => console.log(img.toPNG())) // 截取页面内容
  // wc.printToPDF({})                              // 打印为 PDF
  // wc.setZoomFactor(1.25)                          // 页面缩放

  // 页面事件
  wc.on('did-finish-load', () => {}) // 加载完成
  wc.on('did-fail-load', (_e, code, desc) => {}) // 加载失败（可做离线兜底页）
  wc.on('did-navigate', (_e, url) => {}) // 导航到新地址
  wc.on('render-process-gone', () => {}) // 渲染进程崩溃（可做崩溃恢复）
  wc.on('before-input-event', (e, input) => {
    // 拦截键盘按键（如自定义 F12 开关 DevTools）
    // e.preventDefault()
  })

  // 拦截新窗口：让所有外链走系统浏览器而不是新开 Electron 窗口（安全标配）
  wc.setWindowOpenHandler(({ url }) => {
    // shell.openExternal(url)
    return { action: 'deny' } // deny 拒绝弹窗
  })
}

// ============================ 14. contextBridge / preload 安全桥接 ============================

/**
 * preload 脚本（electron/preload/index.ts）示例：
 *
 * import { contextBridge, ipcRenderer } from 'electron'
 *
 * contextBridge.exposeInMainWorld('electronAPI', {
 *   // 渲染进程可调用的"白名单"API，而不是暴露整个 ipcRenderer（安全原则：最小暴露）
 *   getUserInfo: (id: number) => ipcRenderer.invoke('user:get-info', id),
 *   sendLog: (msg: string) => ipcRenderer.send('log:write', msg),
 *   onTaskProgress: (cb: (data: unknown) => void) =>
 *     ipcRenderer.on('task:progress', (_e, data) => cb(data))
 * })
 *
 * 渲染进程中（src/ 下）直接使用：
 *   const user = await window.electronAPI.getUserInfo(1)
 */

// ============================ 15. nativeImage 原生图片 ============================

// import { nativeImage } from 'electron'
// nativeImage.createFromPath('resources/icon.png')  // 从文件创建（托盘/通知图标用）
// nativeImage.createFromDataURL(dataURL)            // 从 base64 dataURL 创建
// nativeImage.createEmpty()                         // 空图片
// image.resize({ width: 16, height: 16 })           // 缩放（托盘图标适配高分屏）
// image.toPNG() / image.toJPEG(80)                  // 导出为二进制
// image.toDataURL()                                 // 导出为 dataURL（配合渲染进程展示）

// ============================ 16. protocol 自定义协议 ============================

/**
 * 注册 app:// 协议，让页面以自定义协议加载本地资源（比 file:// 更安全、可控）
 *
 * import { protocol, net } from 'electron'
 * import { pathToFileURL } from 'node:url'
 *
 * protocol.registerSchemesAsPrivileged([
 *   { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
 * ])
 *
 * app.whenReady().then(() => {
 *   protocol.handle('app', (request) => {
 *     // 把 app://host/xxx 映射到本地文件
 *     const filePath = '...' // 解析 request.url 得到实际路径
 *     return net.fetch(pathToFileURL(filePath).toString())
 *   })
 * })
 */

// ============================ 17. powerMonitor 电源监控 ============================

// import { powerMonitor } from 'electron'  // 需在 app ready 之后使用
// powerMonitor.on('suspend', () => {})     // 系统休眠
// powerMonitor.on('resume', () => {})      // 系统唤醒（恢复轮询任务）
// powerMonitor.on('on-ac', () => {})       // 接通电源
// powerMonitor.on('on-battery', () => {})  // 切换电池（可降级耗性能任务）
// powerMonitor.on('lock-screen', () => {}) // 锁屏
// powerMonitor.getSystemIdleTime()         // 系统空闲秒数（做"无操作自动锁屏"类功能）

// ============================ 18. nativeTheme / systemPreferences 外观 ============================

// import { nativeTheme, systemPreferences } from 'electron'
// nativeTheme.shouldUseDarkColors                    // 当前是否深色模式（跟随系统主题切换 UI）
// nativeTheme.on('updated', () => {})                // 系统主题变化事件
// nativeTheme.themeSource = 'dark'                   // 强制主题：'system' | 'light' | 'dark'
// systemPreferences.getAccentColor()                 // 系统强调色（如 macOS 高亮蓝）

// ============================ 19. desktopCapturer 屏幕捕获 ============================

// import { desktopCapturer } from 'electron'
// async function captureScreen() {
//   const sources = await desktopCapturer.getSources({
//     types: ['screen', 'window'], // screen 整个屏幕 / window 单个窗口
//     thumbnailSize: { width: 1920, height: 1080 }
//   })
//   // sources[i].thumbnail 即 nativeImage，配合 clipboard.writeImage 或存盘实现截图
//   return sources
// }

// ============================ 20. net 网络请求 ============================

// import { net } from 'electron'
// 使用 Chromium 网络栈发请求（自动共享 session Cookie、代理，比 Node http 更适合 Electron）
// const resp = await net.fetch('https://api.example.com/data', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ page: 1 })
// })
// const data = await resp.json()
// 也可用 net.request() 获得更底层的流式控制

// ============================ 21. utilityProcess 子进程 ============================

/**
 * 从主进程派生带 Node 能力的子进程，处理 CPU 密集任务（避免阻塞主进程）
 *
 * import { utilityProcess, UtilityProcess } from 'electron'
 *
 * const child = utilityProcess.fork('worker.js', [], { serviceName: 'calc-worker' })
 * child.postMessage({ task: 'heavy-calc' })  // 与子进程通信（MessagePort 协议）
 * child.on('message', (msg) => { ... })
 * child.kill()                               // 结束子进程
 */

// ============================ 22. crashReporter 崩溃上报 ============================

// import { crashReporter } from 'electron'
// 需在 app ready 前尽早调用，把崩溃堆栈上报到自有服务
// crashReporter.start({
//   uploadToServer: true,
//   submitURL: 'https://your-server.com/crash',
//   productName: 'electron-demo',
//   compress: true
// })

// ============================ 23. 自动更新（electron-updater） ============================

/**
 * 自动更新一般使用社区方案 electron-updater（配合 electron-builder 打包）：
 *
 * import { autoUpdater } from 'electron-updater'
 *
 * autoUpdater.autoDownload = true          // 检测到新版本自动下载
 * autoUpdater.checkForUpdates()            // 检查更新（读取 latest.yml 配置）
 * autoUpdater.on('update-available', () => {})   // 有新版本
 * autoUpdater.on('download-progress', (p) => {}) // 下载进度 p.percent
 * autoUpdater.on('update-downloaded', () => {})  // 下载完成
 * autoUpdater.quitAndInstall()             // 退出并安装更新
 */

// ============================ 24. 渲染进程专属 API ============================

/**
 * webFrame —— 渲染进程内控制页面缩放：
 *
 * import { webFrame } from 'electron'
 * webFrame.setZoomFactor(1.0)         // 缩放比例
 * webFrame.setZoomLimit({ maximum: 2, minimum: 0.5 })
 * webFrame.executeJavaScript('...')   // 在当前页面执行脚本
 *
 * 注意：渲染进程默认拿不到这些 API，需要在 preload 中按需暴露，
 * 或在 BrowserWindow webPreferences 中开启 sandbox: false 后通过 @electron/remote 访问（不推荐，有安全风险）。
 */

export {}
