import type { ApiCategory } from './types'

/** webContents 页面控制 */
export const webContentsCategory: ApiCategory = {
  id: 'web-contents',
  title: 'webContents 页面控制',
  icon: 'View',
  color: '#3B82F6',
  desc: '页面加载、执行脚本、拦截外链、崩溃恢复',
  items: [
    {
      name: '加载 / DevTools / 缩放',
      demo: 'wc-title',
      desc: '每个窗口自带一个 webContents 实例',
      code: `const wc = win.webContents

wc.loadURL('https://example.com')
wc.reload()
wc.openDevTools({ mode: 'detach' }) // 独立窗口打开 DevTools
wc.setZoomFactor(1.25)
wc.executeJavaScript('document.title') // 执行 JS 并取返回值
wc.capturePage().then(img => img.toPNG()) // 页面截图`
    },
    {
      name: '常用事件',
      desc: 'did-fail-load 做离线兜底，render-process-gone 做崩溃恢复',
      code: `wc.on('did-finish-load', () => {})
wc.on('did-fail-load', (_e, code, desc) => {
  console.error('加载失败:', code, desc) // 可加载本地错误页
})
wc.on('render-process-gone', () => {
  wc.reload() // 渲染进程崩溃后自动恢复
})
wc.on('before-input-event', (e, input) => {
  // 拦截键盘，如自定义 F12 开关 DevTools
})`
    },
    {
      name: 'setWindowOpenHandler 拦截外链',
      desc: '让所有新窗口链接走系统浏览器，是 Electron 安全标配',
      code: `wc.setWindowOpenHandler(({ url }) => {
  if (url.startsWith('https:')) shell.openExternal(url)
  return { action: 'deny' } // 拒绝在应用内弹新窗
})`
    }
  ]
}
