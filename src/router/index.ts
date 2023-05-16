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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router;
