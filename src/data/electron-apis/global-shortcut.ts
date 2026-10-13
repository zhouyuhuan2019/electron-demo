import type { ApiCategory } from './types'

/** globalShortcut 全局快捷键 */
export const globalShortcutCategory: ApiCategory = {
  id: 'global-shortcut',
  title: 'globalShortcut 全局快捷键',
  icon: 'Key',
  color: '#9C27B0',
  desc: '应用不在前台也能响应的快捷键',
  items: [
    {
      name: '注册 / 注销',
      demo: 'global-shortcut-demo',
      desc: 'CommandOrControl 在 mac 是 Cmd，win/linux 是 Ctrl',
      code: `import { globalShortcut } from 'electron'

globalShortcut.register('CommandOrControl+Shift+X', () => {
  console.log('全局快捷键触发')
})

globalShortcut.isRegistered('CommandOrControl+Shift+X')
globalShortcut.unregisterAll() // 应用退出前注销`
    }
  ]
}
