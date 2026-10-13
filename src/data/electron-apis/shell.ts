import type { ApiCategory } from './types'

/** shell 系统交互 */
export const shellCategory: ApiCategory = {
  id: 'shell',
  title: 'shell 系统交互',
  icon: 'Link',
  color: '#722ED1',
  desc: '浏览器打开链接、打开文件、显示所在文件夹',
  items: [
    {
      name: '常用方法',
      demo: 'shell-open',
      desc: '外链一律走系统浏览器；showItemInFolder 是下载完成后的标准体验',
      code: `import { shell } from 'electron'

shell.openExternal('https://electronjs.org') // 系统浏览器打开
shell.openPath('/Users/xx/file.pdf')          // 系统默认程序打开
shell.showItemInFolder('/Users/xx/file.pdf')  // 在文件夹中显示
shell.trashItem('/path/to/file')              // 移入回收站
shell.beep()                                  // 系统提示音`
    }
  ]
}
