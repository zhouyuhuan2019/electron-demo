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
    }
  ]
})

export default router
