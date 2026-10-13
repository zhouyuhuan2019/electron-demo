<script setup lang="ts">
import { ref } from 'vue'

const currentDir = ref('')
const files = ref<Array<{
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: string
  ext: string
}>>([])
const fileContent = ref('')
const contentTitle = ref('')
const loading = ref(false)

async function selectDir() {
  const dir = await window.ipcRenderer.invoke('file:select-dir')
  if (dir) {
    currentDir.value = dir
    await loadDir(dir)
  }
}

async function loadDir(dirPath: string) {
  loading.value = true
  try {
    files.value = await window.ipcRenderer.invoke('file:list-dir', dirPath)
    currentDir.value = dirPath
  } finally {
    loading.value = false
  }
}

async function openFile(file: { path: string; isDirectory: boolean }) {
  if (file.isDirectory) {
    await loadDir(file.path)
  } else {
    const result = await window.ipcRenderer.invoke('file:read-text', file.path)
    contentTitle.value = file.path
    fileContent.value = result.content
  }
}

function goUp() {
  const parent = currentDir.value.split('/').slice(0, -1).join('/') || '/'
  loadDir(parent)
}

function formatSize(bytes: number) {
  if (bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatTime(iso: string) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div class="file-manager">
    <h2 class="file-manager__title">文件管理</h2>

    <!-- 工具栏 -->
    <div class="file-manager__toolbar">
      <el-button type="primary" @click="selectDir">
        <el-icon><FolderOpened /></el-icon>
        选择目录
      </el-button>
      <el-button :disabled="!currentDir" @click="goUp">
        <el-icon><Top /></el-icon>
        上级目录
      </el-button>
      <el-input
        v-model="currentDir"
        placeholder="当前目录"
        readonly
        class="file-manager__path"
      />
    </div>

    <!-- 文件列表 -->
    <el-card v-if="currentDir" class="file-manager__list" shadow="hover" v-loading="loading">
      <el-table :data="files" size="small" @row-dblclick="openFile">
        <el-table-column label="名称" min-width="200">
          <template #default="{ row }">
            <div class="file-manager__name">
              <el-icon v-if="row.isDirectory" color="#E6A23C"><Folder /></el-icon>
              <el-icon v-else color="#909399"><Document /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template #default="{ row }">{{ row.isDirectory ? '-' : formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column label="修改时间" width="180">
          <template #default="{ row }">{{ formatTime(row.modified) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 文件内容预览 -->
    <el-card v-if="fileContent" class="file-manager__preview" shadow="hover">
      <template #header>
        <div class="file-manager__preview-header">
          <span>文件内容</span>
          <el-button size="small" text @click="fileContent = ''">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="file-manager__preview-title">{{ contentTitle }}</div>
      <pre class="file-manager__content">{{ fileContent }}</pre>
    </el-card>

    <el-empty v-if="!currentDir" description="请先选择一个目录" />
  </div>
</template>

<style lang="scss" scoped>
.file-manager {
  &__title {
    margin: 0 0 20px;
    font-size: 20px;
    font-weight: 600;
  }

  &__toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__path {
    flex: 1;
  }

  &__list {
    margin-bottom: 16px;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__preview {
    margin-bottom: 16px;
  }

  &__preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

  &__preview-title {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    font-family: 'SF Mono', Menlo, Consolas, monospace;
  }

  &__content {
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
