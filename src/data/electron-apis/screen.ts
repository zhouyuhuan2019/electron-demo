import type { ApiCategory } from './types'

/** screen 屏幕信息 */
export const screenCategory: ApiCategory = {
  id: 'screen',
  title: 'screen 屏幕信息',
  icon: 'FullScreen',
  color: '#13C2C2',
  desc: '多显示器、缩放比、鼠标坐标',
  items: [
    {
      name: '显示器信息',
      demo: 'screen-info',
      desc: 'screen 需在 app ready 之后使用；多屏定位窗口必备',
      code: `import { screen } from 'electron'

screen.getPrimaryDisplay()     // 主屏幕（含 workArea、scaleFactor）
screen.getAllDisplays()        // 所有显示器
screen.getCursorScreenPoint()  // 鼠标坐标（跟随鼠标弹窗）
screen.getDisplayNearestPoint({ x: 100, y: 100 })

screen.on('display-added', () => {})   // 接入新显示器
screen.on('display-removed', () => {})`
    }
  ]
}
