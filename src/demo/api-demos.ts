/**
 * API 手册交互示例 —— 渲染端定义
 * 每个 demo 由若干可点击的动作组成，动作通过 IPC 调用主进程真实 API。
 * 结果统一为文本；截图类 demo 返回 { image: dataURL }。
 */
import { ref } from 'vue'

/** 动作执行结果：文本 或 图片(dataURL) */
export type DemoResult = string | { image: string }

export interface DemoAction {
  /** 按钮文案 */
  label: string
  /** 执行逻辑 */
  run: () => Promise<DemoResult>
}

export interface DemoDef {
  /** 示例标题 */
  title: string
  /** 动作按钮列表 */
  actions: DemoAction[]
}

/** globalShortcut demo 的触发计数（主进程 send → 此处监听累加） */
export const shortcutTriggerCount = ref(0)

// 防止 HMR 时重复注册监听
const w = window as typeof window & { __demoShortcutBound?: boolean }
if (window.ipcRenderer && !w.__demoShortcutBound) {
  w.__demoShortcutBound = true
  window.ipcRenderer.on('demo:shortcut-triggered', () => {
    shortcutTriggerCount.value++
  })
}

export const apiDemos: Record<string, DemoDef> = {
  'app-info': {
    title: '获取真实的应用环境信息',
    actions: [
      {
        label: '获取版本信息',
        run: async () => {
          const r = (await window.ipcRenderer.invoke('demo:app-info')) as Record<string, string | boolean>
          return [
            `应用版本：${r.version}`,
            `Electron：${r.electron}`,
            `Node.js：${r.node}`,
            `Chromium：${r.chrome}`,
            `运行环境：${r.isPackaged ? '打包后（生产）' : '开发环境'}`
          ].join('\n')
        }
      }
    ]
  },

  'app-paths': {
    title: '读取系统路径',
    actions: [
      {
        label: '获取常用路径',
        run: async () => {
          const r = (await window.ipcRenderer.invoke('demo:app-paths')) as Record<string, string>
          return Object.entries(r)
            .map(([k, v]) => `${k}：${v}`)
            .join('\n')
        }
      }
    ]
  },

  'window-new': {
    title: '真实创建一个新窗口',
    actions: [
      {
        label: '创建新窗口',
        run: async () => (await window.ipcRenderer.invoke('demo:window-new')) as string
      }
    ]
  },

  'window-hide-show': {
    title: '隐藏与恢复窗口',
    actions: [
      {
        label: '隐藏 1.5 秒后恢复',
        run: async () => (await window.ipcRenderer.invoke('demo:window-hide-show')) as string
      }
    ]
  },

  'window-center': {
    title: '窗口居中并读取位置尺寸',
    actions: [
      {
        label: '居中窗口',
        run: async () => (await window.ipcRenderer.invoke('demo:window-center')) as string
      }
    ]
  },

  'window-state': {
    title: '切换窗口置顶状态',
    actions: [
      {
        label: '置顶 / 取消置顶',
        run: async () => (await window.ipcRenderer.invoke('demo:window-state')) as string
      }
    ]
  },

  'window-progress': {
    title: '任务栏进度条动画',
    actions: [
      {
        label: '播放进度条',
        run: async () => (await window.ipcRenderer.invoke('demo:window-progress')) as string
      }
    ]
  },

  'ipc-invoke': {
    title: 'invoke/handle 真实往返通信',
    actions: [
      {
        label: '发送消息给主进程',
        run: async () => {
          const r = (await window.ipcRenderer.invoke('demo:ipc-echo', '你好，主进程！')) as {
            echo: string
            time: string
          }
          return `主进程已回复（${r.time}）：${r.echo}`
        }
      }
    ]
  },

  'dialog-open': {
    title: '打开系统文件选择框',
    actions: [
      {
        label: '选择文件',
        run: async () => (await window.ipcRenderer.invoke('demo:dialog-open')) as string
      }
    ]
  },

  'dialog-save': {
    title: '打开系统保存对话框',
    actions: [
      {
        label: '选择保存位置',
        run: async () => (await window.ipcRenderer.invoke('demo:dialog-save')) as string
      }
    ]
  },

  'dialog-message': {
    title: '原生消息确认框',
    actions: [
      {
        label: '弹出消息框',
        run: async () => (await window.ipcRenderer.invoke('demo:dialog-message')) as string
      }
    ]
  },

  'notification-send': {
    title: '发送系统原生通知',
    actions: [
      {
        label: '发送通知',
        run: async () => (await window.ipcRenderer.invoke('demo:notification-send')) as string
      }
    ]
  },

  'global-shortcut-demo': {
    title: '注册全局快捷键（15 秒后自动注销）',
    actions: [
      {
        label: '注册快捷键',
        run: async () => (await window.ipcRenderer.invoke('demo:shortcut-register')) as string
      },
      {
        label: '立即注销',
        run: async () => (await window.ipcRenderer.invoke('demo:shortcut-unregister')) as string
      }
    ]
  },

  'clipboard-text': {
    title: '剪贴板读写',
    actions: [
      {
        label: '写入文本',
        run: async () =>
          (await window.ipcRenderer.invoke(
            'demo:clipboard-write',
            `Consum Electron - ${new Date().toLocaleTimeString()}`
          )) as string
      },
      {
        label: '读取文本',
        run: async () => (await window.ipcRenderer.invoke('demo:clipboard-read')) as string
      }
    ]
  },

  'screen-info': {
    title: '读取显示器与鼠标信息',
    actions: [
      {
        label: '获取屏幕信息',
        run: async () => (await window.ipcRenderer.invoke('demo:screen-info')) as string
      }
    ]
  },

  'shell-open': {
    title: '调用系统浏览器打开网页',
    actions: [
      {
        label: '打开 electronjs.org',
        run: async () => (await window.ipcRenderer.invoke('demo:shell-open')) as string
      }
    ]
  },

  'session-cookie': {
    title: 'Cookie 写入 / 读取 / 清除',
    actions: [
      {
        label: '写入 Cookie',
        run: async () => (await window.ipcRenderer.invoke('demo:cookie-set')) as string
      },
      {
        label: '读取 Cookie',
        run: async () => (await window.ipcRenderer.invoke('demo:cookie-read')) as string
      },
      {
        label: '清除 Cookie',
        run: async () => (await window.ipcRenderer.invoke('demo:cookie-clear')) as string
      }
    ]
  },

  'wc-title': {
    title: '在页面中执行脚本并取返回值',
    actions: [
      {
        label: '读取页面标题',
        run: async () => (await window.ipcRenderer.invoke('demo:wc-title')) as string
      }
    ]
  },

  'native-theme-toggle': {
    title: '读取并切换系统主题偏好',
    actions: [
      {
        label: '切换深色 / 浅色',
        run: async () =>
          (await window.ipcRenderer.invoke('demo:native-theme-toggle')) as string
      }
    ]
  },

  'power-idle': {
    title: '获取系统空闲时间',
    actions: [
      {
        label: '查询空闲秒数',
        run: async () => (await window.ipcRenderer.invoke('demo:power-idle')) as string
      }
    ]
  },

  'capture-screen': {
    title: '捕获屏幕画面',
    actions: [
      {
        label: '截取屏幕',
        run: async () =>
          (await window.ipcRenderer.invoke('demo:capture-screen')) as DemoResult
      }
    ]
  },

  'net-fetch': {
    title: '使用 Chromium 网络栈发请求',
    actions: [
      {
        label: '请求 npm 镜像接口',
        run: async () => (await window.ipcRenderer.invoke('demo:net-fetch')) as string
      }
    ]
  }
}
