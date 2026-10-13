/**
 * Electron 常用 API 手册 —— 数据汇总
 *
 * 目录结构：每个分类一个文件，新增分类时：
 *  1. 新建 xxx.ts 导出一个 ApiCategory
 *  2. 在下方 apiCategories 数组中引入
 */
import type { ApiCategory } from './types'
import { appCategory } from './app'
import { browserWindowCategory } from './browser-window'
import { ipcCategory } from './ipc'
import { dialogCategory } from './dialog'
import { menuCategory } from './menu'
import { trayCategory } from './tray'
import { notificationCategory } from './notification'
import { globalShortcutCategory } from './global-shortcut'
import { clipboardCategory } from './clipboard'
import { screenCategory } from './screen'
import { shellCategory } from './shell'
import { sessionCategory } from './session'
import { webContentsCategory } from './web-contents'
import { nativeImageCategory } from './native-image'
import { advancedCategory } from './advanced'

export type { ApiCategory, ApiItem } from './types'

export const apiCategories: ApiCategory[] = [
  appCategory,
  browserWindowCategory,
  ipcCategory,
  dialogCategory,
  menuCategory,
  trayCategory,
  notificationCategory,
  globalShortcutCategory,
  clipboardCategory,
  screenCategory,
  shellCategory,
  sessionCategory,
  webContentsCategory,
  nativeImageCategory,
  advancedCategory
]
