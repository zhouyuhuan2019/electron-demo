<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const shortcut = ref('CommandOrControl+Shift+X')
const status = ref({ count: 0, registered: false })
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// 监听主进程推送的快捷键触发事件
function onTriggered(_event: unknown, data: { accelerator: string; count: number }) {
  status.value.count = data.count
  message.value = `快捷键 ${data.accelerator} 已触发 ${data.count} 次`
  messageType.value = 'success'
}

onMounted(async () => {
  status.value = await window.ipcRenderer.invoke('shortcut:status')
  window.ipcRenderer.on('global-shortcut-triggered', onTriggered)
})

onUnmounted(() => {
  window.ipcRenderer.removeListener('global-shortcut-triggered', onTriggered)
})

async function register() {
  const result = await window.ipcRenderer.invoke('shortcut:register', shortcut.value)
  message.value = result.message
  messageType.value = result.success ? 'success' : 'error'
  status.value = await window.ipcRenderer.invoke('shortcut:status')
}

async function unregister() {
  const result = await window.ipcRenderer.invoke('shortcut:unregister', shortcut.value)
  message.value = result.message
  messageType.value = result.success ? 'success' : 'error'
  status.value = await window.ipcRenderer.invoke('shortcut:status')
}

function resetCount() {
  status.value.count = 0
}
</script>

<template>
  <div class="shortcut-page">
    <h2 class="shortcut-page__title">全局快捷键</h2>
    <p class="shortcut-page__desc">注册系统级快捷键，即使应用不在前台也能响应</p>

    <!-- 注册面板 -->
    <el-card class="shortcut-page__card" shadow="hover">
      <div class="shortcut-page__form">
        <el-input
          v-model="shortcut"
          placeholder="快捷键，如 CommandOrControl+Shift+X"
          class="shortcut-page__input"
        >
          <template #prepend>快捷键</template>
        </el-input>
        <el-button type="primary" @click="register">
          <el-icon><Key /></el-icon>
          注册
        </el-button>
        <el-button @click="unregister">
          <el-icon><Close /></el-icon>
          注销
        </el-button>
      </div>
      <div class="shortcut-page__hint">
        格式：CommandOrControl（mac=Cmd，win=Ctrl）+ Alt/Shift/字母，多个修饰键用 + 连接
      </div>
    </el-card>

    <!-- 状态面板 -->
    <el-card class="shortcut-page__card" shadow="hover">
      <template #header>
        <span>快捷键状态</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前快捷键">{{ shortcut }}</el-descriptions-item>
        <el-descriptions-item label="注册状态">
          <el-tag :type="status.registered ? 'success' : 'info'" size="small">
            {{ status.registered ? '已注册' : '未注册' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="触发次数">
          <el-tag type="primary" size="small">{{ status.count }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button size="small" text type="primary" @click="resetCount">重置计数</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 消息提示 -->
    <el-alert
      v-if="message"
      :title="message"
      :type="messageType"
      show-icon
      :closable="false"
      class="shortcut-page__alert"
    />

    <!-- 使用说明 -->
    <el-card class="shortcut-page__card" shadow="hover">
      <template #header>
        <span>使用说明</span>
      </template>
      <ol class="shortcut-page__guide">
        <li>输入快捷键组合（如 <code>CommandOrControl+Shift+X</code>）</li>
        <li>点击「注册」按钮</li>
        <li>切换到其他应用（如浏览器、编辑器）</li>
        <li>按下快捷键，观察触发次数变化</li>
        <li>点击「注销」释放快捷键</li>
      </ol>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.shortcut-page {
  &__title {
    margin: 0 0 8px;
    font-size: 20px;
    font-weight: 600;
  }

  &__desc {
    margin: 0 0 20px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__card {
    margin-bottom: 16px;
  }

  &__form {
    display: flex;
    gap: 12px;
  }

  &__input {
    flex: 1;
  }

  &__hint {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__alert {
    margin-bottom: 16px;
  }

  &__guide {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 2;
    color: var(--el-text-color-regular);

    code {
      padding: 2px 6px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      font-family: 'SF Mono', Menlo, Consolas, monospace;
      font-size: 12px;
    }
  }
}
</style>
