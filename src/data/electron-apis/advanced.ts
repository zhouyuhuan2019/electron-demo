import type { ApiCategory } from './types'

/** 进阶 API */
export const advancedCategory: ApiCategory = {
  id: 'advanced',
  title: '进阶 API',
  icon: 'MagicStick',
  color: '#8B5CF6',
  desc: '电源、截图、网络、子进程、崩溃上报、自动更新',
  items: [
    {
      name: 'powerMonitor 电源监控',
      demo: 'power-idle',
      desc: '休眠唤醒、电池状态、系统空闲时间',
      code: `import { powerMonitor } from 'electron'

powerMonitor.on('resume', () => {})   // 系统唤醒，恢复轮询
powerMonitor.on('on-battery', () => {}) // 切到电池，降级任务
powerMonitor.getSystemIdleTime() // 空闲秒数（无操作自动锁屏）`
    },
    {
      name: 'desktopCapturer 屏幕捕获',
      demo: 'capture-screen',
      desc: '获取屏幕/窗口图像源，实现截图功能',
      code: `import { desktopCapturer } from 'electron'

const sources = await desktopCapturer.getSources({
  types: ['screen', 'window'],
  thumbnailSize: { width: 1920, height: 1080 }
})
// sources[i].thumbnail 为 nativeImage`
    },
    {
      name: 'net 网络请求',
      demo: 'net-fetch',
      desc: '基于 Chromium 网络栈，自动共享 session Cookie 与代理',
      code: `import { net } from 'electron'

const resp = await net.fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ page: 1 })
})
const data = await resp.json()`
    },
    {
      name: 'utilityProcess 子进程',
      desc: '派生带 Node 能力的子进程跑 CPU 密集任务，不阻塞主进程',
      code: `import { utilityProcess } from 'electron'

const child = utilityProcess.fork('worker.js', [], {
  serviceName: 'calc-worker'
})
child.postMessage({ task: 'heavy-calc' })
child.on('message', (msg) => { /* 结果 */ })
child.kill()`
    },
    {
      name: 'crashReporter 崩溃上报',
      desc: '需在 app ready 前尽早调用',
      code: `import { crashReporter } from 'electron'

crashReporter.start({
  uploadToServer: true,
  submitURL: 'https://your-server.com/crash',
  productName: 'consum-electron',
  compress: true
})`
    },
    {
      name: 'autoUpdater 自动更新',
      desc: '使用 electron-updater（npm 包），配合 electron-builder 打包',
      code: `import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true
autoUpdater.checkForUpdates()

autoUpdater.on('download-progress', (p) => {
  console.log(\`下载进度: \${p.percent}%\`)
})
autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall() // 退出并安装
})`
    }
  ]
}
