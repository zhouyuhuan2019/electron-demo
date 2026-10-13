<script setup lang="ts">
import { computed, ref } from 'vue'
import { apiDemos, shortcutTriggerCount, type DemoResult } from '@/demo/api-demos'

const props = defineProps<{ /** demo 标识，对应 src/demo/api-demos.ts 的 key */ demo: string }>()

const def = computed(() => apiDemos[props.demo])

const loadingLabel = ref('')
const resultText = ref('')
const resultImage = ref('')
const errorMsg = ref('')

async function runAction(action: { label: string; run: () => Promise<DemoResult> }) {
  loadingLabel.value = action.label
  errorMsg.value = ''
  try {
    const result = await action.run()
    if (typeof result === 'string') {
      resultText.value = result
      resultImage.value = ''
    } else {
      resultText.value = ''
      resultImage.value = result.image
    }
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : String(err)
  } finally {
    loadingLabel.value = ''
  }
}
</script>

<template>
  <div v-if="def" class="api-demo">
    <div class="api-demo__head">
      <el-icon :size="14" class="api-demo__head-icon"><Pointer /></el-icon>
      <span>交互示例 · {{ def.title }}</span>
    </div>

    <div class="api-demo__actions">
      <el-button
        v-for="action in def.actions"
        :key="action.label"
        size="small"
        type="primary"
        plain
        :loading="loadingLabel === action.label"
        @click="runAction(action)"
      >
        {{ action.label }}
      </el-button>
    </div>

    <pre v-if="resultText" class="api-demo__result">{{ resultText }}</pre>
    <img v-if="resultImage" :src="resultImage" class="api-demo__image" alt="演示结果" />
    <div v-if="demo === 'global-shortcut-demo' && shortcutTriggerCount > 0" class="api-demo__hit">
      快捷键已触发 {{ shortcutTriggerCount }} 次
    </div>
    <el-alert v-if="errorMsg" :title="`执行失败：${errorMsg}`" type="error" :closable="false" />
  </div>
</template>

<style lang="scss" scoped>
.api-demo {
  padding: 12px 14px;
  margin: 12px 0;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;

  &__head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }

  &__head-icon {
    color: var(--el-color-success);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__result {
    margin: 10px 0 0;
    padding: 10px 12px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__image {
    display: block;
    max-width: 100%;
    margin-top: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  &__hit {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-color-success);
  }

  .el-alert {
    margin-top: 10px;
  }
}
</style>
