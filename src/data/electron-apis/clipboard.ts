import type { ApiCategory } from './types'

/** clipboard 剪贴板 */
export const clipboardCategory: ApiCategory = {
  id: 'clipboard',
  title: 'clipboard 剪贴板',
  icon: 'DocumentCopy',
  color: '#2ECC71',
  desc: '文本、图片的复制粘贴',
  items: [
    {
      name: '读写文本 / 图片',
      demo: 'clipboard-text',
      desc: '主进程和渲染进程均可使用',
      code: `import { clipboard } from 'electron'

clipboard.writeText('复制的文本')
clipboard.readText()

clipboard.writeImage(nativeImage) // 写入图片
clipboard.readImage()             // 读取图片
clipboard.clear()
clipboard.availableFormats() // ['text/plain', ...]`
    }
  ]
}
