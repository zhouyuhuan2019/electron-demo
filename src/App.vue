<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const version = ref('')
const route = useRoute()

onMounted(async () => {
  version.value = await window.ipcRenderer.invoke('get-app-version')
})
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <router-link to="/" class="app-header__title">
        <el-icon :size="24"><Elephant /></el-icon>
        <span>Consum Electron</span>
      </router-link>
      <div class="app-header__right">
        <router-link
          to="/electron-api"
          class="app-header__nav"
          :class="{ 'app-header__nav--active': route.path === '/electron-api' }"
        >
          <el-icon><Collection /></el-icon>
          <span>API 手册</span>
        </router-link>
        <span class="app-header__version">v{{ version }}</span>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view />
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
    color: var(--el-text-color-primary);
    text-decoration: none;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-decoration: none;
    padding: 4px 10px;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &--active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
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
