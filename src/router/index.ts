import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../components/HelloWorld.vue'),
    meta: {}
  },
  {
    path: '/gis',
    component: () => import('../components/GIS.vue'),
    meta: {}
  },
  {
    path: '/amap',
    component: () => import('../components/Amap.vue'),
    meta: {}
  },
  {
    path: '/demo',
    component: () => import('../components/OlDemo.vue'),
    meta: {}
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
