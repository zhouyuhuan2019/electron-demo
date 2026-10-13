import type { ApiCategory } from './types'

/** session 会话 / Cookie / 下载 */
export const sessionCategory: ApiCategory = {
  id: 'session',
  title: 'session 会话 / Cookie / 下载',
  icon: 'Download',
  color: '#F97316',
  desc: 'Cookie 管理、多账号隔离、下载拦截',
  items: [
    {
      name: 'Cookie 管理',
      demo: 'session-cookie',
      desc: '读写删除 Cookie，或 clearStorageData 清空存储',
      code: `import { session } from 'electron'

await session.defaultSession.cookies.set({
  url: 'https://example.com', name: 'token', value: 'abc'
})
const cookies = await session.defaultSession.cookies.get({})
await session.defaultSession.cookies.remove('https://example.com', 'token')
await session.defaultSession.clearStorageData() // 退出登录清缓存`
    },
    {
      name: '独立会话（多账号）',
      desc: '不同 partition 互相隔离，可实现多账号同时登录',
      code: `const s1 = session.fromPartition('persist:account1')
const s2 = session.fromPartition('persist:account2')
// 创建窗口时指定：new BrowserWindow({ webPreferences: { session: s1 } })`
    },
    {
      name: 'will-download 拦截下载',
      desc: '指定保存路径、监听下载进度',
      code: `session.defaultSession.on('will-download', (event, item) => {
  item.setSavePath('/Users/xx/downloads/file.zip') // 跳过另存为
  item.on('updated', () => {
    const p = item.getReceivedBytes() / item.getTotalBytes()
    win?.webContents.send('download:progress', p) // 推送进度
  })
  item.once('done', (_e, state) => {
    console.log(state === 'completed' ? '完成' : '中断')
  })
})`
    }
  ]
}
