/**
 * API 手册交互示例 —— 主进程 handlers
 * 统一以 demo: 前缀注册，供渲染进程（src/demo/api-demos.ts）通过 IPC 调用。
 */
import {
  app,
  BrowserWindow,
  clipboard,
  desktopCapturer,
  dialog,
  globalShortcut,
  ipcMain,
  nativeTheme,
  net,
  Notification,
  powerMonitor,
  screen,
  session,
  shell
} from 'electron'

/** 获取当前主窗口（窗口操作类 demo 使用） */
function mainWindow(): BrowserWindow | null {
  return BrowserWindow.getAllWindows()[0] ?? null
}

function boundsText(win: BrowserWindow): string {
  const { x, y, width, height } = win.getBounds()
  return `x=${x}, y=${y}, width=${width}, height=${height}`
}

export function registerDemoHandlers(): void {
  // ==================== app ====================
  ipcMain.handle('demo:app-info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    electron: process.versions.electron,
    node: process.versions.node,
    chrome: process.versions.chrome
  }))

  ipcMain.handle('demo:app-paths', () => ({
    userData: app.getPath('userData'),
    downloads: app.getPath('downloads'),
    temp: app.getPath('temp'),
    documents: app.getPath('documents')
  }))

  // ==================== BrowserWindow ====================
  ipcMain.handle('demo:window-new', () => {
    const html = encodeURIComponent(
      `<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:80vh;flex-direction:column;color:#555">
        <h2>这是一个新的 BrowserWindow</h2>
        <p>由 demo:window-new 创建，父窗口关闭时会一起关闭</p>
      </body>`
    )
    const child = new BrowserWindow({
      width: 480,
      height: 320,
      parent: mainWindow() ?? undefined,
      autoHideMenuBar: true
    })
    child.loadURL(`data:text/html;charset=utf-8,${html}`)
    return '新窗口已创建，关闭它即可返回'
  })

  ipcMain.handle('demo:window-hide-show', () => {
    const win = mainWindow()
    if (!win) return '未找到主窗口'
    win.hide()
    setTimeout(() => win.show(), 1500)
    return '窗口已隐藏，1.5 秒后自动恢复'
  })

  ipcMain.handle('demo:window-center', () => {
    const win = mainWindow()
    if (!win) return '未找到主窗口'
    win.center()
    return `已居中，当前窗口尺寸：${boundsText(win)}`
  })

  ipcMain.handle('demo:window-state', () => {
    const win = mainWindow()
    if (!win) return '未找到主窗口'
    const next = !win.isAlwaysOnTop()
    win.setAlwaysOnTop(next)
    return next
      ? '窗口已置顶（再次点击取消置顶）'
      : '窗口已取消置顶'
  })

  ipcMain.handle('demo:window-progress', () => {
    const win = mainWindow()
    if (!win) return '未找到主窗口'
    let percent = 0
    const timer = setInterval(() => {
      percent += 10
      win.setProgressBar(percent / 100)
      if (percent >= 100) {
        clearInterval(timer)
        win.setProgressBar(-1) // -1 表示移除进度条
      }
    }, 150)
    return '任务栏进度条动画中，请观察 Dock / 任务栏图标'
  })

  // ==================== IPC ====================
  ipcMain.handle('demo:ipc-echo', (_event, message: string) => ({
    echo: message,
    time: new Date().toLocaleTimeString()
  }))

  // ==================== dialog ====================
  ipcMain.handle('demo:dialog-open', async () => {
    const win = mainWindow()
    const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
      title: '选择文件（交互示例）',
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: '所有文件', extensions: ['*'] }]
    })
    return canceled
      ? '已取消选择'
      : `选中 ${filePaths.length} 个文件：\n${filePaths.join('\n')}`
  })

  ipcMain.handle('demo:dialog-save', async () => {
    const win = mainWindow()
    const { canceled, filePath } = await dialog.showSaveDialog(win!, {
      title: '保存文件（交互示例）',
      defaultPath: 'demo-export.txt'
    })
    return canceled ? '已取消保存' : `保存路径：${filePath}`
  })

  ipcMain.handle('demo:dialog-message', async () => {
    const win = mainWindow()
    const { response } = await dialog.showMessageBox(win!, {
      type: 'question',
      message: '这是一个原生消息框（交互示例）',
      detail: 'showMessageBox 替代网页 alert，返回按钮索引',
      buttons: ['取消', '确定'],
      defaultId: 1,
      cancelId: 0
    })
    return `你点击了：${response === 1 ? '确定' : '取消'}`
  })

  // ==================== Notification ====================
  ipcMain.handle('demo:notification-send', () => {
    const notification = new Notification({
      title: '交互示例',
      body: '这是一条系统原生通知，点击可唤起主窗口',
      silent: false
    })
    notification.on('click', () => mainWindow()?.show())
    notification.show()
    return '通知已发送，请查看系统通知中心'
  })

  // ==================== globalShortcut ====================
  ipcMain.handle('demo:shortcut-register', () => {
    const registered = globalShortcut.register('CommandOrControl+Shift+X', () => {
      mainWindow()?.webContents.send('demo:shortcut-triggered')
    })
    if (!registered) return '注册失败，快捷键可能被其他应用占用'
    // 15 秒后自动注销，避免长期占用系统快捷键
    setTimeout(() => globalShortcut.unregister('CommandOrControl+Shift+X'), 15000)
    return '已注册 Cmd/Ctrl+Shift+X（15 秒后自动注销），切到其他应用按一下试试'
  })

  ipcMain.handle('demo:shortcut-unregister', () => {
    globalShortcut.unregister('CommandOrControl+Shift+X')
    return '已注销快捷键'
  })

  // ==================== clipboard ====================
  ipcMain.handle('demo:clipboard-write', (_event, text: string) => {
    clipboard.writeText(text)
    return `已写入剪贴板：${text}`
  })

  ipcMain.handle('demo:clipboard-read', () => {
    const text = clipboard.readText()
    return text ? `当前剪贴板内容：${text}` : '剪贴板为空'
  })

  // ==================== screen ====================
  ipcMain.handle('demo:screen-info', () => {
    const primary = screen.getPrimaryDisplay()
    const all = screen.getAllDisplays()
    const lines = all.map(
      (d, i) =>
        `显示器 ${i + 1}${d.id === primary.id ? '（主屏）' : ''}：${d.size.width}x${d.size.height}，缩放 ${d.scaleFactor}，工作区 ${d.workArea.width}x${d.workArea.height}`
    )
    const point = screen.getCursorScreenPoint()
    lines.push(`当前鼠标坐标：(${point.x}, ${point.y})`)
    return lines.join('\n')
  })

  // ==================== shell ====================
  ipcMain.handle('demo:shell-open', async () => {
    await shell.openExternal('https://www.electronjs.org')
    return '已在系统默认浏览器中打开 electronjs.org'
  })

  // ==================== session / Cookie ====================
  ipcMain.handle('demo:cookie-set', async () => {
    await session.defaultSession.cookies.set({
      url: 'https://demo.local',
      name: 'demo_token',
      value: `electron-${Date.now()}`
    })
    return '已写入 Cookie：demo_token'
  })

  ipcMain.handle('demo:cookie-read', async () => {
    const cookies = await session.defaultSession.cookies.get({})
    if (!cookies.length) return '当前会话没有 Cookie'
    return cookies.map((c) => `${c.name} = ${c.value}`).join('\n')
  })

  ipcMain.handle('demo:cookie-clear', async () => {
    const cookies = await session.defaultSession.cookies.get({})
    for (const c of cookies) {
      await session.defaultSession.cookies.remove(
        `https://${c.domain?.replace(/^\./, '') ?? 'demo.local'}`,
        c.name
      )
    }
    return '已清除全部 Cookie'
  })

  // ==================== webContents ====================
  ipcMain.handle('demo:wc-title', async () => {
    const win = mainWindow()
    if (!win) return '未找到主窗口'
    const title = await win.webContents.executeJavaScript('document.title')
    return `executeJavaScript 读取到当前页面标题：${title}`
  })

  // ==================== nativeTheme ====================
  ipcMain.handle('demo:native-theme-toggle', () => {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
    return `已切换为「${nativeTheme.shouldUseDarkColors ? '深色' : '浅色'}」模式（themeSource=${nativeTheme.themeSource}）`
  })

  // ==================== powerMonitor ====================
  ipcMain.handle('demo:power-idle', () => {
    const idle = powerMonitor.getSystemIdleTime()
    return `系统已空闲 ${idle} 秒（动一下鼠标再点可看到变化）`
  })

  // ==================== desktopCapturer ====================
  ipcMain.handle('demo:capture-screen', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 560, height: 350 }
    })
    const dataUrl = sources[0]?.thumbnail.toDataURL()
    if (!dataUrl) {
      return '未获取到画面：macOS 需要在「系统设置 → 隐私与安全性 → 屏幕录制」中授权本应用'
    }
    return { image: dataUrl }
  })

  // ==================== net ====================
  ipcMain.handle('demo:net-fetch', async () => {
    const resp = await net.fetch('https://registry.npmmirror.com/electron/latest', {
      method: 'GET'
    })
    const data = (await resp.json()) as { version?: string }
    return `net.fetch 请求成功：状态码 ${resp.status}，npm 上 electron 最新版本为 ${data.version}`
  })
}
