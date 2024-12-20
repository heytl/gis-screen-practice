import { type RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/HelloWorld.vue'),
    meta: {}
  },
  {
    path: '/gis',
    component: () => import('@/views/openlayers/echarts/GIS.vue'),
    meta: {}
  },
  {
    path: '/amap',
    component: () => import('@/views/amap/Amap.vue'),
    meta: {}
  },
  {
    path: '/demo',
    component: () => import('@/views/openlayers/demo/DevMap.vue'),
    meta: {}
  },
  {
    path: '/ol-cesium',
    component: () => import('@/views/openlayers/ol-cesium/index.vue'),
    meta: {}
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
