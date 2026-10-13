<script setup lang="ts">
import { ref } from 'vue'

const msg = ref('欢迎使用 Consum Electron！')
const count = ref(0)
</script>

<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Platform /></el-icon>
            <span>项目信息</span>
          </div>
        </template>
        <ul>
          <li><strong>Electron</strong> + <strong>Vue 3</strong></li>
          <li><strong>Element Plus</strong> UI 组件库</li>
          <li><strong>TypeScript</strong> 类型安全</li>
          <li><strong>electron-vite</strong> 构建工具</li>
          <li><strong>Pinia</strong> 状态管理</li>
        </ul>
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Pointer /></el-icon>
            <span>交互测试</span>
          </div>
        </template>
        <p>{{ msg }}</p>
        <p>点击次数：<el-tag type="primary">{{ count }}</el-tag></p>
        <el-button type="primary" @click="count++">
          <el-icon><Plus /></el-icon> 点我 +1
        </el-button>
        <el-button @click="count = 0">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </el-card>
    </el-col>
  </el-row>

  <!-- Electron API 手册入口 -->
  <el-card class="home-entry" shadow="hover" @click="$router.push('/electron-api')">
    <div class="home-entry__inner">
      <el-icon :size="28" class="home-entry__icon"><Collection /></el-icon>
      <div class="home-entry__text">
        <div class="home-entry__title">Electron 常用 API 手册</div>
        <div class="home-entry__desc">app / 窗口 / IPC / 对话框 / 托盘 / 下载 / 自动更新…分类速查，支持搜索</div>
      </div>
      <el-button type="primary" plain>
        进入查阅
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* ==================== home-entry API 手册入口卡片 ==================== */
.home-entry {
  margin-top: 20px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__icon {
    color: var(--el-color-primary);
  }

  &__text {
    flex: 1;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
  }

  &__desc {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
