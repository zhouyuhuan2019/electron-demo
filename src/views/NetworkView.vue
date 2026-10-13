<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://registry.npmmirror.com/electron/latest')
const method = ref('GET')
const body = ref('')
const loading = ref(false)
const result = ref<Record<string, unknown> | null>(null)
const history = ref<Array<{
  url: string
  method: string
  status: number
  elapsed: number
  time: string
}>>([])

async function sendRequest() {
  loading.value = true
  result.value = null
  try {
    const resp = await window.ipcRenderer.invoke('net:fetch', url.value, method.value, body.value || undefined)
    result.value = resp
    history.value.unshift({
      url: url.value,
      method: method.value,
      status: resp.status as number,
      elapsed: resp.elapsed as number,
      time: new Date().toLocaleTimeString()
    })
  } catch (err) {
    result.value = { error: err instanceof Error ? err.message : String(err) }
  } finally {
    loading.value = false
  }
}

function formatJson(data: unknown) {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
</script>

<template>
  <div class="net-page">
    <h2 class="net-page__title">网络请求</h2>
    <p class="net-page__desc">基于 Electron net 模块（Chromium 网络栈），自动共享 session Cookie 与代理</p>

    <!-- 请求面板 -->
    <el-card class="net-page__card" shadow="hover">
      <div class="net-page__form">
        <el-select v-model="method" class="net-page__method">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
        <el-input v-model="url" placeholder="输入请求 URL" class="net-page__url" />
        <el-button type="primary" :loading="loading" @click="sendRequest">
          <el-icon><Promotion /></el-icon>
          发送
        </el-button>
      </div>
      <el-input
        v-if="method !== 'GET' && method !== 'DELETE'"
        v-model="body"
        type="textarea"
        :rows="4"
        placeholder='请求体 JSON，如 {"key": "value"}'
        class="net-page__body"
      />
    </el-card>

    <!-- 响应结果 -->
    <el-card v-if="result" class="net-page__card" shadow="hover">
      <template #header>
        <div class="net-page__result-header">
          <span>响应结果</span>
          <el-tag :type="(result.status as number) < 400 ? 'success' : 'danger'" size="small">
            {{ result.status }} {{ result.statusText }}
          </el-tag>
          <span class="net-page__elapsed">{{ result.elapsed }}ms</span>
        </div>
      </template>
      <pre class="net-page__response">{{ formatJson(result.data ?? result) }}</pre>
    </el-card>

    <!-- 历史记录 -->
    <el-card v-if="history.length" class="net-page__card" shadow="hover">
      <template #header>
        <span>请求历史</span>
      </template>
      <el-table :data="history" size="small">
        <el-table-column prop="time" label="时间" width="90" />
        <el-table-column prop="method" label="方法" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.method === 'GET' ? 'primary' : 'warning'">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status < 400 ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="elapsed" label="耗时" width="80">
          <template #default="{ row }">{{ row.elapsed }}ms</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.net-page {
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

  &__method {
    width: 110px;
    flex-shrink: 0;
  }

  &__url {
    flex: 1;
  }

  &__body {
    margin-top: 12px;
  }

  &__result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
  }

  &__elapsed {
    margin-left: auto;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-weight: 400;
  }

  &__response {
    margin: 0;
    padding: 12px;
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 8px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    max-height: 400px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
