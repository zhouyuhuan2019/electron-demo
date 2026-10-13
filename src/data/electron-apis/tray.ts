import type { ApiCategory } from './types'

/** Tray 系统托盘 */
export const trayCategory: ApiCategory = {
  id: 'tray',
  title: 'Tray 系统托盘',
  icon: 'Histogram',
  color: '#FF9F43',
  desc: '托盘图标、右键菜单、最小化到托盘',
  items: [
    {
      name: '创建托盘',
      desc: '图标打包后必须用绝对路径；结合窗口 close 事件实现"最小化到托盘"',
      code: `import { Tray, nativeImage, Menu } from 'electron'

const tray = new Tray(nativeImage.createFromPath('resources/icon.png'))
tray.setToolTip('Consum Electron')

tray.setContextMenu(Menu.buildFromTemplate([
  { label: '显示主窗口', click: () => win.show() },
  { label: '退出', click: () => app.quit() }
]))

tray.on('double-click', () => win.show()) // Windows 双击唤起`
    }
  ]
}
