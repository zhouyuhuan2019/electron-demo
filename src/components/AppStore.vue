<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(true)
const message = ref('来自子组件的消息！')

setTimeout(() => {
  loading.value = false
}, 1500)
</script>

<template>
  <el-card shadow="never" class="store-card">
    <template #header>
      <div class="card-header">
        <el-icon><Grid /></el-icon>
        <span>App Store</span>
      </div>
    </template>

    <el-skeleton :loading="loading" animated :rows="3">
      <p class="store-card__text">
        {{ message }}
      </p>
      <el-alert
        class="store-card__alert"
        title="模板已就绪"
        type="success"
        :closable="false"
        show-icon
      />
    </el-skeleton>
  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.store-card {
  &__text {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__alert {
    margin-top: 16px;
  }
}
</style>
