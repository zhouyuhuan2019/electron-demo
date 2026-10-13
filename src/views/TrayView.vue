<script setup lang="ts">
import { onMounted, ref } from 'vue'

const trayExists = ref(false)
const notifyTitle = ref('来自 Consum Electron')
const notifyBody = ref('这是一条系统原生通知')
const notifyResult = ref('')

onMounted(async () => {
  trayExists.value = await window.ipcRenderer.invoke('tray:exists')
})

async function createTray() {
  const result = await window.ipcRenderer.invoke('tray:create')
  trayExists.value = true
  notifyResult.value = result.message
}

async function destroyTray() {
  const result = await window.ipcRenderer.invoke('tray:destroy')
  trayExists.value = false
  notifyResult.value = result.message
}

async function sendNotification() {
  const result = await window.ipcRenderer.invoke('notification:send', notifyTitle.value, notifyBody.value)
  notifyResult.value = result
}
</script>

<template>
  <div class="tray-page">
    <h2 class="tray-page__title">托盘与通知</h2>
    <p class="tray-page__desc">系统托盘图标、右键菜单、桌面通知</p>

    <!-- 托盘管理 -->
    <el-card class="tray-page__card" shadow="hover">
      <template #header>
        <div class="tray-page__card-header">
          <el-icon><Histogram /></el-icon>
          <span>系统托盘</span>
        </div>
      </template>
      <div class="tray-page__tray-controls">
        <el-button type="primary" @click="createTray">
          <el-icon><Plus /></el-icon>
          创建托盘
        </el-button>
        <el-button type="danger" plain @click="destroyTray">
          <el-icon><Delete /></el-icon>
          销毁托盘
        </el-button>
        <el-tag :type="trayExists ? 'success' : 'info'" class="tray-page__tray-status">
          {{ trayExists ? '托盘运行中' : '托盘未创建' }}
        </el-tag>
      </div>
      <div class="tray-page__tray-hint">
        创建托盘后，窗口最小化时应用不会退出，而是驻留在系统托盘。双击托盘图标可恢复窗口。
      </div>
    </el-card>

    <!-- 通知发送 -->
    <el-card class="tray-page__card" shadow="hover">
      <template #header>
        <div class="tray-page__card-header">
          <el-icon><Bell /></el-icon>
          <span>发送通知</span>
        </div>
      </template>
      <div class="tray-page__notify-form">
        <el-input v-model="notifyTitle" placeholder="通知标题" class="tray-page__notify-input" />
        <el-input v-model="notifyBody" placeholder="通知内容" type="textarea" :rows="2" class="tray-page__notify-input" />
        <el-button type="primary" @click="sendNotification">
          <el-icon><Promotion /></el-icon>
          发送通知
        </el-button>
      </div>
    </el-card>

    <!-- 结果提示 -->
    <el-alert
      v-if="notifyResult"
      :title="notifyResult"
      type="success"
      show-icon
      :closable="false"
      class="tray-page__alert"
    />
  </div>
</template>

<style lang="scss" scoped>
.tray-page {
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

  &__card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  &__tray-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__tray-status {
    margin-left: auto;
  }

  &__tray-hint {
    margin-top: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }

  &__notify-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__notify-input {
    max-width: 400px;
  }

  &__alert {
    margin-top: 16px;
  }
}
</style>
