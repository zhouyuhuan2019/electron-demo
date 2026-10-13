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
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
</style>
