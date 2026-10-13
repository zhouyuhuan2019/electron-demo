import type { ApiCategory } from './types'

/** app 应用生命周期 */
export const appCategory: ApiCategory = {
  id: 'app',
  title: 'app 应用生命周期',
  icon: 'Box',
  color: '#409EFF',
  desc: '应用全局控制：启动、退出、路径、单实例锁',
  items: [
    {
      name: 'app.whenReady()',
      demo: 'app-info',
      desc: '等待 Electron 初始化完成，所有主进程逻辑从这里开始',
      code: `import { app } from 'electron'

app.whenReady().then(() => {
  // 应用初始化完成，可以创建窗口了
  createWindow()
})`
    },
    {
      name: 'window-all-closed',
      desc: '所有窗口关闭时触发；macOS 一般不退出，保留 Dock 激活行为',
      code: `app.on('window-all-closed', () => {
  // 非 macOS 平台直接退出
  if (process.platform !== 'darwin') app.quit()
})`
    },
    {
      name: '退出 / 重启',
      desc: 'quit 触发事件后退出，exit 立即强制退出，relaunch 配合 quit 实现重启',
      code: `app.quit()      // 依次触发 before-quit → will-quit → quit
app.exit(0)     // 立即强制退出，不触发任何事件
app.relaunch()  // 标记重启（需再调用 quit 生效）
app.quit()`
    },
    {
      name: 'app.getPath(name)',
      demo: 'app-paths',
      desc: '获取系统路径，userData 用于存放应用配置和数据文件',
      code: `app.getPath('userData')    // 用户数据目录（存配置/数据库）
app.getPath('downloads')   // 下载目录
app.getPath('temp')        // 临时目录
app.getPath('exe')         // 应用可执行文件路径`
    },
    {
      name: 'app.isPackaged / getVersion',
      desc: '判断是否为打包环境（区分开发/生产逻辑）、读取版本号',
      code: `if (app.isPackaged) {
  // 生产环境逻辑
}
console.log(app.getVersion()) // package.json 中的 version`
    },
    {
      name: '单实例锁',
      desc: '防止应用多开，重复启动时聚焦已有窗口',
      code: `if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  // 用户尝试二次打开时：恢复并聚焦主窗口
  win?.restore()
  win?.focus()
})`
    },
    {
      name: '开机自启',
      desc: '设置应用随系统启动',
      code: `app.setLoginItemSettings({
  openAtLogin: true,            // 开机自启
  path: app.getPath('exe')
})

app.getLoginItemSettings().openAtLogin // 查询当前状态`
    }
  ]
}
