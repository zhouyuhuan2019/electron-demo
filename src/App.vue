<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AppStore from './components/AppStore.vue'

const version = ref('')

onMounted(async () => {
  version.value = await window.ipcRenderer.invoke('get-app-version')
  ElMessage.success('应用已启动！')
})
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="app-header__title">
        <el-icon :size="24"><Elephant /></el-icon>
        <span>Consum Electron</span>
      </div>
      <div class="app-header__version">v{{ version }}</div>
    </el-header>

    <el-main class="app-main">
      <AppStore />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  &__version {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.app-main {
  padding: 20px;
  background: var(--el-bg-color-page);
}
</style>
