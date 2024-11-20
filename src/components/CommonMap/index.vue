<template>
  <div id="bg-map" :ref="(el) => (mapRef = el)">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import 'ol/ol.css'
import { ref, onMounted, provide } from 'vue'
import { Map, View } from 'ol'
import { defaults } from 'ol/control'
import { defaults as interactionDefaults } from 'ol/interaction'
import { fromLonLat, useGeographic } from 'ol/proj'
import { transform } from 'ol/proj'
import { createTDTLayerWMTS } from '@/utils/map/layer'
import LayerGroup from 'ol/layer/Group'
const projection = ref('EPSG:3857')
const center = ref([104.510458, 31.317388]) // 中心点坐标
const minZoom = ref(4)
const zoom = ref(13)
const emits = defineEmits(['click', 'singleclick', 'pointermove', 'mapDefined'])

// useGeographic()
const mapRef = ref(null)

const map = new Map({
  controls: defaults({
    zoom: false
  }),
  interactions: interactionDefaults({
    doubleClickZoom: false //屏蔽双击放大事件
  })
})
emits('mapDefined', map)

map.on('click', (event) => emits('click', event))
map.on('singleclick', (event) => emits('singleclick', event))
map.on('pointermove', (event) => emits('pointermove', event))
// 添加天地图作为底图
function addTDTLayer(map) {
  const tdt_vec_c = createTDTLayerWMTS('vec_w')
  const tdt_cva_c = createTDTLayerWMTS('cva_w')
  const tdtVectorGroup = new LayerGroup({
    visible: true,
    layers: [tdt_vec_c, tdt_cva_c]
  })
  map?.addLayer(tdtVectorGroup)
  tdt_cva_c.on('postrender', (event) => {
    filterCanvas(event.context)
  })
}

function initMap() {
  map.setTarget(mapRef.value)
  map.setView(
    new View({
      // 地图视图
      projection: projection.value,
      center: fromLonLat(center.value),
      minZoom: minZoom.value, // 地图缩放最小级别
      zoom: zoom.value // 地图缩放级别（打开页面时默认级别）
    })
  )
  // 添加基础图层
  addTDTLayer(map)
}

function resetView() {
  map.updateSize()
  map.setView(
    new View({
      // 地图视图
      projection: projection.value,
      center: center.value,
      minZoom: minZoom.value, // 地图缩放最小级别
      zoom: zoom.value // 地图缩放级别（打开页面时默认级别）
    })
  )
}

// 视图缩放至某区域
function viewFit(extent, options = {}) {
  if (!map) return
  map?.getView()?.fit(extent, {
    maxZoom: 18,
    duration: 1000,
    padding: [50, 50, 50, 50],
    ...options
  })
}

function animateView(options: object = {}) {
  map?.getView()?.animate({
    center: center.value,
    zoom: zoom.value,
    duration: 1500,
    ...options
  })
}

/**
 * 过滤 Canvas 实现地图效果
 */
function filterCanvas(context) { //设置地图样式
  context.save()
  context.filter = 'brightness(0.65) hue-rotate(20deg) contrast(2.1) grayscale(1.5) saturate(0) sepia(0.8) invert(0.9) '
  context.drawImage(context.canvas, 0, 0)
  context.restore()
}

onMounted(() => {
  initMap()
})

defineExpose({
  map,
  resetView,
  viewFit,
  animateView
})

provide('map', map)
provide('mapVm', map)
</script>

<style lang="scss" scoped>
#bg-map {
  width: 100%;
  height: 100%;
}
</style>
