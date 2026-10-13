import type { ApiCategory } from './types'

/** nativeImage / nativeTheme */
export const nativeImageCategory: ApiCategory = {
  id: 'native-image',
  title: 'nativeImage / nativeTheme',
  icon: 'Picture',
  color: '#E84393',
  desc: '原生图片处理与系统外观（深色模式）',
  items: [
    {
      name: 'nativeImage 图片',
      desc: '托盘、通知图标的载体，可与渲染进程互传 dataURL',
      code: `import { nativeImage } from 'electron'

const img = nativeImage.createFromPath('resources/icon.png')
img.resize({ width: 16, height: 16 }) // 适配高分屏托盘
img.toPNG()    // 导出二进制
img.toDataURL() // 导出 dataURL`
    },
    {
      name: 'nativeTheme 深色模式',
      demo: 'native-theme-toggle',
      desc: '跟随系统主题切换 UI，也可强制指定主题',
      code: `import { nativeTheme } from 'electron'

nativeTheme.shouldUseDarkColors // 当前是否深色模式
nativeTheme.on('updated', () => {
  // 系统主题变化，通知渲染进程切换样式
  win?.webContents.send('theme:changed', nativeTheme.shouldUseDarkColors)
})
nativeTheme.themeSource = 'dark' // 'system' | 'light' | 'dark'`
    }
  ]
}
