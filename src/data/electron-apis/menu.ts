import type { ApiCategory } from './types'

/** Menu 菜单 */
export const menuCategory: ApiCategory = {
  id: 'menu',
  title: 'Menu 菜单',
  icon: 'Menu',
  color: '#F56C6C',
  desc: '应用顶部菜单与右键菜单',
  items: [
    {
      name: '应用菜单',
      desc: 'accelerator 设置快捷键，role 直接复用内置行为',
      code: `const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: '文件',
    submenu: [
      { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => {} },
      { type: 'separator' },
      { role: 'quit', label: '退出' }
    ]
  },
  { role: 'editMenu' }, // 复制/粘贴等内置编辑菜单
  { label: '视图', submenu: [
      { role: 'reload' }, { role: 'toggleDevTools' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }
  ] }
]
Menu.setApplicationMenu(Menu.buildFromTemplate(template))`
    },
    {
      name: '右键菜单',
      desc: '在鼠标位置弹出，一般由渲染进程通过 IPC 触发',
      code: `const contextMenu = Menu.buildFromTemplate([
  { label: '复制', role: 'copy' },
  { label: '粘贴', role: 'paste' },
  { type: 'separator' },
  { label: '自定义操作', click: () => {} }
])
contextMenu.popup({ window: win })`
    }
  ]
}
