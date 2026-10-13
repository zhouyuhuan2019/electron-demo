import type { ApiCategory } from './types'

/** BrowserWindow 窗口管理 */
export const browserWindowCategory: ApiCategory = {
  id: 'browser-window',
  title: 'BrowserWindow 窗口管理',
  icon: 'Monitor',
  color: '#6C5CE7',
  desc: '窗口创建、尺寸位置、状态控制、常用事件',
  items: [
    {
      name: '创建窗口',
      demo: 'window-new',
      desc: '常用 options：show:false 避免 white 闪烁；webPreferences 安全配置为标配',
      code: `const win = new BrowserWindow({
  width: 1200, height: 800,
  minWidth: 800, minHeight: 600,
  show: false,               // 等渲染完再显示，避免白屏
  frame: true,               // false = 无边框窗口（自定义标题栏）
  autoHideMenuBar: true,     // 按 Alt 唤出菜单栏
  webPreferences: {
    preload: '',             // 预加载脚本路径
    contextIsolation: true,  // 上下文隔离（安全必开）
    nodeIntegration: false   // 关闭 Node 集成（安全必关）
  }
})

win.once('ready-to-show', () => win.show())`
    },
    {
      name: '加载页面',
      desc: '开发环境加载 dev-server，生产环境加载本地文件',
      code: `if (process.env.VITE_DEV_SERVER_URL) {
  win.loadURL(process.env.VITE_DEV_SERVER_URL)
} else {
  win.loadFile('out/renderer/index.html')
}`
    },
    {
      name: '显示 / 隐藏 / 关闭',
      demo: 'window-hide-show',
      desc: 'hide 常用于"点关闭最小化到托盘"，close 可被拦截，destroy 强制销毁',
      code: `win.show()     // 显示并聚焦
win.hide()     // 隐藏（进程仍在）
win.close()    // 关闭（可被 close 事件 e.preventDefault() 拦截）
win.destroy()  // 强制销毁，不触发事件`
    },
    {
      name: '尺寸 / 位置',
      demo: 'window-center',
      desc: 'getBounds 与 setBounds 是窗口定位的核心',
      code: `win.center()                                  // 居中
const { x, y, width, height } = win.getBounds() // 读取
win.setBounds({ x: 100, y: 100, width: 800, height: 600 })`
    },
    {
      name: '窗口状态',
      demo: 'window-state',
      desc: '最小化、最大化、置顶、全屏',
      code: `win.minimize()            // 最小化
win.maximize()            // 最大化
win.restore()             // 还原
win.isMaximized()         // 是否最大化
win.setAlwaysOnTop(true)  // 窗口置顶（画中画类应用常用）
win.setFullScreen(true)   // 全屏`
    },
    {
      name: '实用小功能',
      demo: 'window-progress',
      desc: '任务栏进度条、闪烁提醒、标题',
      code: `win.setProgressBar(0.5)   // 任务栏进度条（下载场景）
win.flashFrame(true)      // 任务栏闪烁提醒（Windows）
win.setTitle('新标题')`
    },
    {
      name: '常用事件',
      desc: 'close 可拦截（如确认退出），closed 后对象已释放',
      code: `win.on('resize', () => {})
win.on('focus', () => {})
win.on('blur', () => {})
win.on('close', (e) => {
  // e.preventDefault() // 拦截关闭，例如隐藏到托盘
})
win.on('closed', () => {
  win = null // 窗口已销毁，释放引用
})`
    }
  ]
}
