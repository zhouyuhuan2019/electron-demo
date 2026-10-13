import type { ApiCategory } from './types'

/** IPC 进程通信 */
export const ipcCategory: ApiCategory = {
  id: 'ipc',
  title: 'IPC 进程通信',
  icon: 'Connection',
  color: '#00B8A9',
  desc: '主进程与渲染进程通信的三种模式',
  items: [
    {
      name: 'invoke / handle（推荐）',
      demo: 'ipc-invoke',
      desc: '渲染进程请求、主进程响应，天然支持 async/await',
      code: `// —— 主进程 ——
ipcMain.handle('user:get-info', async (_event, userId: number) => {
  return { id: userId, name: '张三' }
})

// —— 渲染进程（经 preload 暴露）——
const user = await window.electronAPI.getUserInfo(1)`
    },
    {
      name: 'send / on（单向）',
      desc: '渲染进程单向通知主进程，无返回值',
      code: `// —— 主进程 ——
ipcMain.on('log:write', (_event, msg: string) => {
  console.log('渲染进程消息:', msg)
})

// —— 渲染进程 ——
window.electronAPI.sendLog('hello')`
    },
    {
      name: 'webContents.send（主 → 渲染）',
      desc: '主进程主动推送，如下载进度、任务状态',
      code: `// —— 主进程 ——
win.webContents.send('task:progress', { id: 1, percent: 80 })

// —— 渲染进程 ——
ipcRenderer.on('task:progress', (_e, data) => {
  console.log(\`任务\${data.id}进度:\${data.percent}%\`)
})`
    },
    {
      name: 'preload 暴露（安全规范）',
      desc: '只暴露白名单方法，而非整个 ipcRenderer',
      code: `// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getUserInfo: (id: number) => ipcRenderer.invoke('user:get-info', id),
  sendLog: (msg: string) => ipcRenderer.send('log:write', msg),
  onTaskProgress: (cb: (data: unknown) => void) =>
    ipcRenderer.on('task:progress', (_e, data) => cb(data))
})`
    }
  ]
}
