import { app, BrowserWindow, shell, ipcMain, dialog, net, globalShortcut, Tray, Menu, nativeImage, screen, Notification as ElectronNotification } from 'electron'
import { release, cpus, totalmem, freemem } from 'node:os'
import { join, extname } from 'node:path'
import { readdir, readFile, stat } from 'node:fs/promises'
import { registerDemoHandlers } from './demos'

// electron-vite 默认输出目录结构
//
// └── out/
//     ├── main/index.js      > Electron-Main
//     ├── preload/index.js   > Preload-Scripts
//     └── renderer/index.html> Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, 'renderer')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

let win: BrowserWindow | null = null
let tray: Tray | null = null
const shortcutTriggerCount = { count: 0 }

const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

// ==================== 系统信息 ====================
function getSystemInfo() {
  const cpu = cpus()[0]
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome,
    cpuModel: cpu?.model ?? 'Unknown',
    cpuCores: cpus().length,
    totalMem: totalmem(),
    freeMem: freemem(),
    uptime: process.uptime()
  }
}

function getAppPaths() {
  return {
    userData: app.getPath('userData'),
    downloads: app.getPath('downloads'),
    temp: app.getPath('temp'),
    documents: app.getPath('documents'),
    exe: app.getPath('exe')
  }
}

function getScreenInfo() {
  const primary = screen.getPrimaryDisplay()
  const displays = screen.getAllDisplays()
  const point = screen.getCursorScreenPoint()
  return {
    primary: {
      size: primary.size,
      scaleFactor: primary.scaleFactor,
      workArea: primary.workArea
    },
    displays: displays.map((d, i) => ({
      index: i + 1,
      isPrimary: d.id === primary.id,
      size: d.size,
      scaleFactor: d.scaleFactor
    })),
    cursor: { x: point.x, y: point.y }
  }
}

// ==================== 文件管理 ====================
async function listDirectory(dirPath: string) {
  const entries = await readdir(dirPath)
  const items = await Promise.all(
    entries.map(async (name) => {
      const fullPath = join(dirPath, name)
      try {
        const s = await stat(fullPath)
        return {
          name,
          path: fullPath,
          isDirectory: s.isDirectory(),
          size: s.size,
          modified: s.mtime.toISOString(),
          ext: extname(name).toLowerCase()
        }
      } catch {
        return { name, path: fullPath, isDirectory: false, size: 0, modified: '', ext: '' }
      }
    })
  )
  // 目录排前面，文件按名称排序
  return items.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

async function readTextFile(filePath: string, maxSize = 1024 * 1024) {
  const s = await stat(filePath)
  if (s.size > maxSize) {
    return { content: `[文件过大，仅显示前 ${Math.floor(maxSize / 1024)}KB]`, truncated: true, size: s.size }
  }
  const content = await readFile(filePath, 'utf-8')
  return { content, truncated: false, size: s.size }
}

// ==================== 网络请求 ====================
async function netFetch(url: string, method: string, body?: string) {
  const start = Date.now()
  const resp = await net.fetch(url, {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' && method !== 'HEAD' ? body : undefined
  })
  const elapsed = Date.now() - start
  const text = await resp.text()
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return {
    status: resp.status,
    statusText: resp.statusText,
    elapsed,
    headers: Object.fromEntries([...resp.headers as unknown as [string, string][]]),
    data
  }
}

// ==================== 全局快捷键 ====================
function registerGlobalShortcut(accelerator: string) {
  if (globalShortcut.isRegistered(accelerator)) {
    return { success: false, message: '该快捷键已被注册' }
  }
  const ok = globalShortcut.register(accelerator, () => {
    shortcutTriggerCount.count++
    win?.webContents.send('global-shortcut-triggered', { accelerator, count: shortcutTriggerCount.count })
  })
  return { success: ok, message: ok ? '注册成功' : '注册失败，可能被其他应用占用' }
}

function unregisterGlobalShortcut(accelerator: string) {
  globalShortcut.unregister(accelerator)
  return { success: true, message: '已注销' }
}

function getShortcutStatus() {
  return {
    count: shortcutTriggerCount.count,
    registered: globalShortcut.isRegistered('CommandOrControl+Shift+X')
  }
}

// ==================== 托盘与通知 ====================
function createTray() {
  if (tray) return { success: true, message: '托盘已存在' }
  // 生成一个 16x16 的纯色图标
  const size = 16
  const canvas = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 64      // R
    canvas[i * 4 + 1] = 158 // G
    canvas[i * 4 + 2] = 255 // B
    canvas[i * 4 + 3] = 255 // A
  }
  const icon = nativeImage.createFromBuffer(Buffer.from(canvas), { width: size, height: size })
  tray = new Tray(icon)
  tray.setToolTip('Consum Electron')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '显示主窗口', click: () => win?.show() },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() }
    ])
  )
  tray.on('double-click', () => win?.show())
  return { success: true, message: '托盘已创建' }
}

function destroyTray() {
  tray?.destroy()
  tray = null
  return { success: true, message: '托盘已销毁' }
}

async function createWindow() {
  win = new BrowserWindow({
    title: 'Consum Electron',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload,
      // Electron Security Warning (Safe Exploit)
      // https://www.electronjs.org/docs/latest/tutorial/security#3-enable-context-isolation
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(url!)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Apply electron developer tool shortcuts
  win.webContents.on('before-input-event', (event, input) => {
    const ctrlOrCmd = process.platform === 'darwin' ? input.meta : input.control
    if (ctrlOrCmd && input.shift && input.key.toLowerCase() === 'i') {
      win?.webContents.toggleDevTools()
      event.preventDefault()
    }
  })
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// https://www.electronjs.org/docs/latest/tutorial/security#8-do-not-use-enable-features-that-you-do-not-need
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

app.whenReady().then(async () => {
  ipcMain.handle('get-app-version', () => app.getVersion())

  // 系统信息
  ipcMain.handle('sys:get-info', () => getSystemInfo())
  ipcMain.handle('sys:get-paths', () => getAppPaths())
  ipcMain.handle('sys:get-screen', () => getScreenInfo())

  // 文件管理
  ipcMain.handle('file:list-dir', async (_e, dirPath: string) => listDirectory(dirPath))
  ipcMain.handle('file:read-text', async (_e, filePath: string) => readTextFile(filePath))
  ipcMain.handle('file:select-dir', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: '选择目录'
    })
    return canceled ? null : filePaths[0]
  })

  // 网络请求
  ipcMain.handle('net:fetch', async (_e, url: string, method: string, body?: string) => netFetch(url, method, body))

  // 全局快捷键
  ipcMain.handle('shortcut:register', (_e, accelerator: string) => registerGlobalShortcut(accelerator))
  ipcMain.handle('shortcut:unregister', (_e, accelerator: string) => unregisterGlobalShortcut(accelerator))
  ipcMain.handle('shortcut:status', () => getShortcutStatus())

  // 托盘与通知
  ipcMain.handle('tray:create', () => createTray())
  ipcMain.handle('tray:destroy', () => destroyTray())
  ipcMain.handle('tray:exists', () => !!tray)
  ipcMain.handle('notification:send', (_e, title: string, body: string) => {
    const notification = new ElectronNotification({ title, body } as Electron.NotificationConstructorOptions)
    notification.show()
    return '通知已发送'
  })

  // 注册 API 手册交互示例所需的 IPC handlers
  registerDemoHandlers()

  await createWindow()

  app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
      allWindows[0].focus()
    } else {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  }
})
