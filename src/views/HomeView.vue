<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const version = ref('')

onMounted(async () => {
  version.value = await window.ipcRenderer.invoke('get-app-version')
})

// 技术栈列表
const techStack = [
  { name: 'Vue 3', desc: 'Composition API', icon: 'Platform', color: '#42b883' },
  { name: 'Electron', desc: '跨平台桌面', icon: 'Monitor', color: '#47848f' },
  { name: 'Element Plus', desc: 'UI 组件库', icon: 'Brush', color: '#409EFF' },
  { name: 'TypeScript', desc: '类型安全', icon: 'Document', color: '#3178c6' },
  { name: 'electron-vite', desc: '构建工具', icon: 'Lightning', color: '#646cff' },
  { name: 'Pinia', desc: '状态管理', icon: 'Box', color: '#ffd859' }
]

// 功能入口
const features = [
  {
    title: 'Electron API 手册',
    desc: '24 个可交互的 API 示例，点击即运行',
    icon: 'Collection',
    color: '#409EFF',
    path: '/electron-api'
  },
  {
    title: '系统信息',
    desc: '查看版本、路径、进程状态',
    icon: 'InfoFilled',
    color: '#67C23A',
    path: '/system-info'
  },
  {
    title: '文件管理',
    desc: '读取本地文件、目录遍历',
    icon: 'FolderOpened',
    color: '#E6A23C',
    path: '/file-manager'
  },
  {
    title: '网络请求',
    desc: '基于 Chromium 的 net 模块',
    icon: 'Connection',
    color: '#F56C6C',
    path: '/network'
  },
  {
    title: '全局快捷键',
    desc: '注册系统级快捷键监听',
    icon: 'Key',
    color: '#9C27B0',
    path: '/shortcut'
  },
  {
    title: '托盘与通知',
    desc: '最小化到托盘、系统通知',
    icon: 'Bell',
    color: '#EB2F96',
    path: '/tray'
  }
]
</script>

<template>
  <div class="home">
    <!-- ==================== Hero 区域 ==================== -->
    <section class="home-hero">
      <div class="home-hero__content">
        <h1 class="home-hero__title">
          <el-icon :size="36"><Elephant /></el-icon>
          Consum Electron
        </h1>
        <p class="home-hero__subtitle">
          基于 Electron 33 + Vue 3 + Element Plus 的桌面应用开发模板
        </p>
        <div class="home-hero__meta">
          <span class="home-hero__version">v{{ version || '...' }}</span>
          <span class="home-hero__dot">·</span>
          <span>开发环境运行中</span>
        </div>
        <div class="home-hero__actions">
          <el-button type="primary" size="large" @click="router.push('/electron-api')">
            <el-icon><Collection /></el-icon>
            查看 API 手册
          </el-button>
          <el-button size="large" @click="router.push('/system-info')">
            <el-icon><InfoFilled /></el-icon>
            系统信息
          </el-button>
        </div>
      </div>
      <div class="home-hero__visual">
        <div class="home-hero__orb home-hero__orb--1" />
        <div class="home-hero__orb home-hero__orb--2" />
        <div class="home-hero__orb home-hero__orb--3" />
      </div>
    </section>

    <!-- ==================== 技术栈 ==================== -->
    <section class="home-section">
      <h2 class="home-section__title">技术栈</h2>
      <div class="home-tech">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="home-tech__card"
        >
          <span
            class="home-tech__icon"
            :style="{ color: tech.color, background: `${tech.color}15` }"
          >
            <el-icon :size="20"><component :is="tech.icon" /></el-icon>
          </span>
          <div class="home-tech__info">
            <div class="home-tech__name">{{ tech.name }}</div>
            <div class="home-tech__desc">{{ tech.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 功能入口 ==================== -->
    <section class="home-section">
      <h2 class="home-section__title">功能模块</h2>
      <div class="home-features">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="home-feature"
          @click="router.push(feature.path)"
        >
          <span
            class="home-feature__icon"
            :style="{ color: feature.color, background: `${feature.color}15` }"
          >
            <el-icon :size="24"><component :is="feature.icon" /></el-icon>
          </span>
          <div class="home-feature__text">
            <div class="home-feature__title">{{ feature.title }}</div>
            <div class="home-feature__desc">{{ feature.desc }}</div>
          </div>
          <el-icon class="home-feature__arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </section>

    <!-- ==================== 快速开始 ==================== -->
    <section class="home-section">
      <h2 class="home-section__title">快速开始</h2>
      <div class="home-quickstart">
        <div class="home-quickstart__step">
          <div class="home-quickstart__num">1</div>
          <div class="home-quickstart__text">
            <div class="home-quickstart__cmd">npm run dev</div>
            <div class="home-quickstart__desc">启动开发服务器，热更新渲染进程</div>
          </div>
        </div>
        <div class="home-quickstart__step">
          <div class="home-quickstart__num">2</div>
          <div class="home-quickstart__text">
            <div class="home-quickstart__cmd">npm run build</div>
            <div class="home-quickstart__desc">构建生产版本，输出到 out/ 目录</div>
          </div>
        </div>
        <div class="home-quickstart__step">
          <div class="home-quickstart__num">3</div>
          <div class="home-quickstart__text">
            <div class="home-quickstart__cmd">npm run build:mac</div>
            <div class="home-quickstart__desc">打包为 macOS 应用（.app / .dmg）</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
/* ==================== home-hero 头部横幅 ==================== */
.home-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 40px;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;

  &__content {
    position: relative;
    z-index: 1;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #fff;
  }

  &__subtitle {
    margin: 12px 0 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  &__version {
    padding: 2px 10px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 999px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;

    .el-button {
      border-radius: 8px;
    }
  }

  &__visual {
    position: absolute;
    right: 0;
    top: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
  }

  &__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;

    &--1 {
      width: 200px;
      height: 200px;
      background: #a8edea;
      top: -50px;
      right: 10%;
    }

    &--2 {
      width: 150px;
      height: 150px;
      background: #fed6e3;
      bottom: -30px;
      right: 30%;
    }

    &--3 {
      width: 100px;
      height: 100px;
      background: #d299c2;
      top: 50%;
      right: 5%;
    }
  }
}

/* ==================== home-section 通用区块 ==================== */
.home-section {
  margin-bottom: 32px;

  &__title {
    margin: 0 0 16px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

/* ==================== home-tech 技术栈 ==================== */
.home-tech {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  &__card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    transition: box-shadow 0.2s, transform 0.2s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 10px;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

/* ==================== home-features 功能入口 ==================== */
.home-features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.home-feature {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.12);

    .home-feature__arrow {
      transform: translateX(4px);
      color: var(--el-color-primary);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: 10px;
  }

  &__text {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__arrow {
    color: var(--el-text-color-placeholder);
    transition: transform 0.2s, color 0.2s;
  }
}

/* ==================== home-quickstart 快速开始 ==================== */
.home-quickstart {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__step {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
  }

  &__num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    background: var(--el-color-primary);
    border-radius: 50%;
  }

  &__cmd {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-color-primary);
  }

  &__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
