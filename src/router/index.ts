import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/electron-api',
      name: 'electron-api',
      component: () => import('@/views/ElectronApiView.vue')
    },
    {
      path: '/system-info',
      name: 'system-info',
      component: () => import('@/views/SystemInfoView.vue')
    },
    {
      path: '/file-manager',
      name: 'file-manager',
      component: () => import('@/views/FileManagerView.vue')
    },
    {
      path: '/network',
      name: 'network',
      component: () => import('@/views/NetworkView.vue')
    },
    {
      path: '/shortcut',
      name: 'shortcut',
      component: () => import('@/views/ShortcutView.vue')
    },
    {
      path: '/tray',
      name: 'tray',
      component: () => import('@/views/TrayView.vue')
    }
  ]
})

export default router
