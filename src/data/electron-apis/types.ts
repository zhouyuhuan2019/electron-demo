/**
 * API 手册数据类型定义
 */

export interface ApiItem {
  /** API 名称 */
  name: string
  /** 交互示例 id（对应 src/demo/api-demos.ts 的 key），有值时页面展示可运行的示例 */
  demo?: string
  /** 功能说明 */
  desc: string
  /** 示例代码 */
  code: string
}

export interface ApiCategory {
  /** 分类 id（同时用作页面锚点） */
  id: string
  /** 分类标题 */
  title: string
  /** 分类图标（@element-plus/icons-vue 组件名，已在 main.ts 全局注册） */
  icon: string
  /** 分类主题色（用于图标徽章、导航圆点），如 '#409EFF' */
  color: string
  /** 分类一句话简介 */
  desc: string
  /** 该分类下的 API 条目 */
  items: ApiItem[]
}
