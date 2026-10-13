import type { ApiCategory } from './types'

/** Notification 系统通知 */
export const notificationCategory: ApiCategory = {
  id: 'notification',
  title: 'Notification 系统通知',
  icon: 'Bell',
  color: '#EB2F96',
  desc: '发送系统原生通知，点击可唤起窗口',
  items: [
    {
      name: '发送通知',
      demo: 'notification-send',
      desc: 'Windows 下需先 app.setAppUserModelId(app.getName())',
      code: `const notification = new Notification({
  title: '下载完成',
  body: '文件 xxx.zip 已下载完成，点击查看',
  icon: nativeImage.createFromPath('resources/icon.png'),
  silent: false
})

notification.on('click', () => {
  win?.show() // 点击通知唤起窗口
})
notification.show()`
    }
  ]
}
