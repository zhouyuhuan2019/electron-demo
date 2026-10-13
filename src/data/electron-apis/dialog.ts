import type { ApiCategory } from './types'

/** dialog 原生对话框 */
export const dialogCategory: ApiCategory = {
  id: 'dialog',
  title: 'dialog 原生对话框',
  icon: 'Files',
  color: '#E6A23C',
  desc: '文件选择、保存路径、消息确认框',
  items: [
    {
      name: 'showOpenDialog 打开文件',
      demo: 'dialog-open',
      desc: '支持多选、目录选择、类型过滤',
      code: `const { canceled, filePaths } = await dialog.showOpenDialog(win, {
  title: '选择文件',
  defaultPath: app.getPath('documents'),
  properties: ['openFile', 'multiSelections'], // openDirectory 选目录
  filters: [{ name: '图片', extensions: ['jpg', 'png'] }]
})
if (!canceled) console.log(filePaths)`
    },
    {
      name: 'showSaveDialog 保存文件',
      demo: 'dialog-save',
      desc: '让用户选择保存位置与文件名，常配合导出功能',
      code: `const { filePath } = await dialog.showSaveDialog(win, {
  title: '保存文件',
  defaultPath: '导出数据.xlsx',
  filters: [{ name: 'Excel', extensions: ['xlsx'] }
]})
// 拿到 filePath 后用 fs.writeFile 写入`
    },
    {
      name: 'showMessageBox 消息框',
      demo: 'dialog-message',
      desc: '替代 alert 的模态确认框，返回按钮索引',
      code: `const { response } = await dialog.showMessageBox(win, {
  type: 'warning',
  message: '确定要删除这条记录吗？',
  detail: '删除后不可恢复',
  buttons: ['取消', '确定'],
  defaultId: 1,
  cancelId: 0
})
const confirmed = response === 1`
    }
  ]
}
