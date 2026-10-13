<script setup lang="ts">
import { onMounted, ref } from 'vue'

const info = ref<Record<string, string | number>>({})
const paths = ref<Record<string, string>>({})
const screenInfo = ref<Record<string, unknown>>({})

onMounted(async () => {
  info.value = await window.ipcRenderer.invoke('sys:get-info')
  paths.value = await window.ipcRenderer.invoke('sys:get-paths')
  screenInfo.value = await window.ipcRenderer.invoke('sys:get-screen')
})

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h}h ${m}m ${s}s`
}
</script>

<template>
  <div class="sys-info">
    <h2 class="sys-info__title">系统信息</h2>

    <!-- 版本信息 -->
    <el-card class="sys-info__card" shadow="hover">
      <template #header>
        <div class="sys-info__card-header">
          <el-icon><Platform /></el-icon>
          <span>版本信息</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="应用版本">{{ info.version }}</el-descriptions-item>
        <el-descriptions-item label="Electron">{{ info.electron }}</el-descriptions-item>
        <el-descriptions-item label="Node.js">{{ info.node }}</el-descriptions-item>
        <el-descriptions-item label="Chromium">{{ info.chrome }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ info.platform }} ({{ info.arch }})</el-descriptions-item>
        <el-descriptions-item label="运行时长">{{ formatUptime(info.uptime as number) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 硬件信息 -->
    <el-card class="sys-info__card" shadow="hover">
      <template #header>
        <div class="sys-info__card-header">
          <el-icon><Cpu /></el-icon>
          <span>硬件信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="CPU 型号">{{ info.cpuModel }}</el-descriptions-item>
        <el-descriptions-item label="CPU 核心数">{{ info.cpuCores }}</el-descriptions-item>
        <el-descriptions-item label="总内存">{{ formatBytes(info.totalMem as number) }}</el-descriptions-item>
        <el-descriptions-item label="可用内存">{{ formatBytes(info.freeMem as number) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 应用路径 -->
    <el-card class="sys-info__card" shadow="hover">
      <template #header>
        <div class="sys-info__card-header">
          <el-icon><FolderOpened /></el-icon>
          <span>应用路径</span>
        </div>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item v-for="(value, key) in paths" :key="key" :label="key">
          <code class="sys-info__path">{{ value }}</code>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 屏幕信息 -->
    <el-card class="sys-info__card" shadow="hover">
      <template #header>
        <div class="sys-info__card-header">
          <el-icon><Monitor /></el-icon>
          <span>屏幕信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="主屏分辨率">
          {{ (screenInfo.primary as any)?.size?.width }} x {{ (screenInfo.primary as any)?.size?.height }}
        </el-descriptions-item>
        <el-descriptions-item label="缩放比">
          {{ (screenInfo.primary as any)?.scaleFactor }}x
        </el-descriptions-item>
        <el-descriptions-item label="显示器数量">
          {{ (screenInfo.displays as any[])?.length ?? 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="鼠标坐标">
          ({{ (screenInfo.cursor as any)?.x }}, {{ (screenInfo.cursor as any)?.y }})
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.sys-info {
  &__title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
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

  &__path {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    color: var(--el-color-primary);
  }
}
</style>
