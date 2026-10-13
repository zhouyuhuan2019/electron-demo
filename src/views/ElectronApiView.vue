<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { apiCategories } from '@/data/electron-apis'
import { useApiSearch } from '@/composables/use-api-search'
import ApiDemo from '@/components/ApiDemo.vue'

const keyword = ref('')
const { filteredCategories } = useApiSearch(apiCategories, keyword)

// 全量统计（不随搜索变化）
const allTotal = apiCategories.reduce((sum, cat) => sum + cat.items.length, 0)

// —— 滚动联动：高亮左侧分类 + 右侧大纲当前条目 ——
const activeId = ref('')
const currentItemId = ref('')
let observer: IntersectionObserver | null = null

function observeSections() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).id
          // 条目 id 格式：`{分类id}--{索引}`，同步推导当前分类
          currentItemId.value = id
          activeId.value = id.split('--')[0]
        }
      }
    },
    // 顶部 10% ~ 25% 视口区域内的条目视为"当前阅读位置"
    { rootMargin: '-10% 0px -75% 0px' }
  )
  document.querySelectorAll('.api-entry').forEach((el) => observer!.observe(el))
}

watch(filteredCategories, () => nextTick(observeSections), { flush: 'post' })
onMounted(observeSections)
onBeforeUnmount(() => observer?.disconnect())

// 右侧大纲：当前激活分类的条目列表
const activeCategory = computed(() =>
  filteredCategories.value.find((cat) => cat.id === activeId.value)
)

// 平滑滚动到分类或条目
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 复制示例代码（file:// 下降级为 execCommand）
async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  ElMessage.success('已复制到剪贴板')
}
</script>

<template>
  <div class="api-doc">
    <!-- ==================== 吸顶工具栏 ==================== -->
    <header class="api-doc__toolbar">
      <div class="api-doc__brand">
        <el-icon :size="20"><Collection /></el-icon>
        <span class="api-doc__brand-name">Electron API 手册</span>
        <span class="api-doc__brand-badge">v33</span>
      </div>
      <el-input
        v-model="keyword"
        class="api-doc__search"
        placeholder="搜索 API 或功能说明…"
        prefix-icon="Search"
        clearable
      />
    </header>

    <div class="api-doc__body">
      <!-- ==================== 左侧：分类目录 ==================== -->
      <aside class="api-doc__nav">
        <div
          v-for="cat in filteredCategories"
          :key="cat.id"
          class="api-doc__nav-item"
          :class="{ 'api-doc__nav-item--active': activeId === cat.id }"
          @click="scrollToId(cat.id)"
        >
          <span class="api-doc__nav-dot" :style="{ background: cat.color }" />
          <span class="api-doc__nav-label">{{ cat.title }}</span>
          <span class="api-doc__nav-count">{{ cat.items.length }}</span>
        </div>
        <el-empty v-if="!filteredCategories.length" description="无匹配" :image-size="60" />
      </aside>

      <!-- ==================== 中间：文档正文 ==================== -->
      <main class="api-doc__content">
        <div class="api-doc__doc-head">
          <h1 class="api-doc__title">Electron 常用 API 手册</h1>
          <p class="api-doc__subtitle">
            主进程 · 窗口 · IPC · 系统能力，共 {{ apiCategories.length }} 个分类
            {{ allTotal }} 个 API，示例代码可一键复制
          </p>
        </div>

        <section
          v-for="cat in filteredCategories"
          :id="cat.id"
          :key="cat.id"
          class="api-section"
        >
          <div class="api-section__header">
            <span
              class="api-section__badge"
              :style="{ color: cat.color, background: `${cat.color}1a` }"
            >
              <el-icon :size="17"><component :is="cat.icon" /></el-icon>
            </span>
            <div class="api-section__meta">
              <h2 class="api-section__title">{{ cat.title }}</h2>
              <p class="api-section__desc">{{ cat.desc }}</p>
            </div>
          </div>

          <!-- 条目平铺（文档式，无折叠） -->
          <article
            v-for="(item, index) in cat.items"
            :id="`${cat.id}--${index}`"
            :key="item.name"
            class="api-entry"
          >
            <div class="api-entry__head">
              <code class="api-entry__name">{{ item.name }}</code>
              <el-button
                class="api-entry__copy"
                size="small"
                text
                icon="CopyDocument"
                @click="copyCode(item.code)"
              >
                复制
              </el-button>
            </div>
            <p class="api-entry__desc">{{ item.desc }}</p>
            <ApiDemo v-if="item.demo" :demo="item.demo" />
            <pre class="api-code"><code>{{ item.code }}</code></pre>
          </article>
        </section>

        <el-empty v-if="!filteredCategories.length" description="没有找到相关 API，换个关键词试试" />
      </main>

      <!-- ==================== 右侧：页内大纲 ==================== -->
      <aside v-if="activeCategory" class="api-doc__outline">
        <div class="api-doc__outline-title">本节内容</div>
        <div
          v-for="(item, index) in activeCategory.items"
          :key="item.name"
          class="api-doc__outline-item"
          :class="{ 'api-doc__outline-item--active': currentItemId === `${activeCategory.id}--${index}` }"
          @click="scrollToId(`${activeCategory.id}--${index}`)"
        >
          {{ item.name }}
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* ==================== api-doc 工具栏 ==================== */
.api-doc {
  &__toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 56px;
    margin: -20px -20px 0; // 抵消 el-main 内边距，实现通栏
    padding: 0 24px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-primary);
  }

  &__brand-name {
    font-size: 15px;
    font-weight: 600;
  }

  &__brand-badge {
    padding: 1px 8px;
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
  }

  &__search {
    width: 300px;

    :deep(.el-input__wrapper) {
      border-radius: 8px;
    }
  }

  &__body {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    padding: 24px 0 48px;
  }

  /* ==================== 左侧分类目录 ==================== */
  &__nav {
    position: sticky;
    top: 72px;
    width: 208px;
    flex-shrink: 0;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 2px;
    border-left: 2px solid transparent;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }

    &--active {
      border-left-color: var(--el-color-primary);
      color: var(--el-color-primary);
      font-weight: 600;
      background: var(--el-color-primary-light-9);
    }
  }

  &__nav-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 50%;
  }

  &__nav-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__nav-count {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  &__content {
    flex: 1;
    min-width: 0;
    max-width: 760px;
  }

  &__doc-head {
    margin-bottom: 32px;
  }

  &__title {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
  }

  &__subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  /* ==================== 右侧页内大纲 ==================== */
  &__outline {
    position: sticky;
    top: 72px;
    width: 180px;
    flex-shrink: 0;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
  }

  &__outline-title {
    margin-bottom: 8px;
    padding-left: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    letter-spacing: 0.5px;
  }

  &__outline-item {
    padding: 4px 0 4px 12px;
    border-left: 2px solid var(--el-border-color-lighter);
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }

    &--active {
      border-left-color: var(--el-color-primary);
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
}

/* ==================== api-section 分类区块 ==================== */
.api-section {
  margin-bottom: 48px;
  scroll-margin-top: 72px;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 12px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 9px;
  }

  &__title {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
  }

  &__desc {
    margin: 2px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* ==================== api-entry 条目 ==================== */
.api-entry {
  padding: 16px 0;
  scroll-margin-top: 72px;

  & + .api-entry {
    border-top: 1px dashed var(--el-border-color-lighter);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__name {
    padding: 3px 10px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 6px;
  }

  &__copy.el-button {
    color: var(--el-text-color-placeholder);

    &:hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }
  }

  &__desc {
    margin: 10px 0 12px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
  }
}

/* ==================== api-code 代码块 ==================== */
.api-code {
  margin: 0;
  padding: 14px 16px;
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 10px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}

/* 窄屏隐藏右侧大纲 */
@media (max-width: 1100px) {
  .api-doc__outline {
    display: none;
  }
}
</style>
