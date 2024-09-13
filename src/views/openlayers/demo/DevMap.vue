<script setup lang="ts">
import CommonMap from '@/components/CommonMap/index.vue'
import MapPlot from '@/components/Ol/MapPlot.vue'
import { onMounted, ref, watch } from 'vue'
import { useHandleMap } from './hooks/useHandleMapHooks'
import DragRotate from 'ol/interaction/DragRotate'
import DragPan from 'ol/interaction/DragPan'
import { always, altKeyOnly, mouseOnly } from 'ol/events/condition'
import { Graticule } from 'ol/layer'
import { OverviewMap, ScaleLine } from 'ol/control'
import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
const mapRef = ref(null)
const { mapPointerMove, mapClick } = useHandleMap()

onMounted(() => {
  addCustomInteraction()
  // addGraticule()
  // addControls()
})

function addCustomInteraction() {
  // 添加DragPan交互，允许通过鼠标中键拖动视图
  const dragRotate = new DragRotate({
    condition: altKeyOnly // 只在中键按下时触发
  })
  console.log('onMounted-DevMap')
  // 添加DragPan交互，设置条件为中键按下
  const dragPan = new DragPan({
    condition: (event) => {
      return event.originalEvent.button === 1
    } // 仅在中键按下时触发
  })
  // mapRef.value.map.addInteraction(dragPan)
  mapRef.value.map.addInteraction(dragRotate)
}

function addGraticule() {
  // 创建经纬格网层
  const graticule = new Graticule({
    // 经纬度间隔，单位为度
    // strokeStyle: '#bbb',
    // strokeWidth: 0.5,
    // 设置网格线的样式
    showLabels: true
    // 显示经纬度标签
    // labelStyle: {
    //   font: '12px Calibri,sans-serif',
    //   color: '#000',
    //   fill: new ol.style.Fill({
    //     color: 'rgba(255, 255, 255, 0.8)'
    //   }),
    //   stroke: new ol.style.Stroke({
    //     color: '#000',
    //     width: 1
    //   })
    // }
  })
  mapRef.value.map.addLayer(graticule)
}

function addControls() {
  const map = mapRef.value.map
  const xtUrl =
    'https://tiles1.geovisearth.com/base/v1/vec/{z}/{x}/{y}?format=png&tmsIds=w&token=fba2a03dd80a9c4701f54d7519c9e1ded2e0e3675a2d72b6ecba92b63d64530c'
  const basemapLayer = new TileLayer({
    source: new XYZ({
      crossOrigin: '',
      url: xtUrl
    })
  })

  const overViewControl = new OverviewMap({
    layers: [basemapLayer]
  })
  const scaleLine = new ScaleLine()
  map.addControl(scaleLine)
  map.addControl(overViewControl)
}
</script>

<template>
  <CommonMap ref="mapRef" @pointermove="mapPointerMove" @singleclick="mapClick">
  </CommonMap>
</template>

<style lang="sass" scoped></style>
