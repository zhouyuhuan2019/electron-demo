/**
 * API 手册搜索逻辑（UI 与业务分离）
 */
import { computed, type Ref } from 'vue'
import type { ApiCategory } from '@/data/electron-apis'

export function useApiSearch(categories: ApiCategory[], keyword: Ref<string>) {
  const filteredCategories = computed<ApiCategory[]>(() => {
    const kw = keyword.value.trim().toLowerCase()
    // 无关键词时返回全部分类
    if (!kw) return categories

    return categories
      .map((cat) => {
        // 分类标题命中：返回整个分类
        if (cat.title.toLowerCase().includes(kw)) return cat
        // 条目命中：只返回命中的条目
        const items = cat.items.filter(
          (it) =>
            it.name.toLowerCase().includes(kw) || it.desc.toLowerCase().includes(kw)
        )
        return items.length ? { ...cat, items } : null
      })
      .filter((cat): cat is ApiCategory => cat !== null)
  })

  const total = computed(() =>
    filteredCategories.value.reduce((sum, cat) => sum + cat.items.length, 0)
  )

  return { filteredCategories, total }
}
