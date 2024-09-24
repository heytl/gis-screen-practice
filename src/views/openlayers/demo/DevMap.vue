<script setup lang="ts">
import CommonMap from '@/components/CommonMap/index.vue'
import MapPlot from '@/components/Ol/MapPlot.vue'
import MapTool from '@/views/openlayers/demo/components/MapTool.vue'
import MapToolBox from '@/views/openlayers/demo/components/map-toolbox.vue'
import MapToolBoxNew from '@/views/openlayers/demo/components/MapToolBox.vue'
import MapContextMenu from '@/views/openlayers/demo/components/map-contextmenu.vue'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { useHandleMap } from './hooks/useHandleMapHooks'
import { Graticule } from 'ol/layer'
import { OverviewMap, ScaleLine } from 'ol/control'
import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import MiddleClickDragRotate from '@/plugins/ol-mapkit/MiddleClickDragRotate.js'
const mapRef = shallowRef(null)
const toolBoxRef = ref(null)
const { mapPointerMove, mapClick } = useHandleMap()

onMounted(() => {
  addCustomInteraction()
  // addGraticule()
  // addControls()
})

const mapInstance = shallowRef(null)
const mapInited = ref(false)
function mapDefined(map) {
  mapInstance.value = map
  mapInited.value = true
  console.log('map', mapInstance.value);
}

function addCustomInteraction() {
  const rotateInteraction = new MiddleClickDragRotate();
  mapRef.value.map.addInteraction(rotateInteraction);
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

function deleteFeature(feature) {
  feature && toolBoxRef.value.deleteFeature(feature)
}
</script>

<template>
  <CommonMap ref="mapRef" @pointermove="mapPointerMove" @singleclick="mapClick" @mapDefined="mapDefined">
    <MapTool />
    <MapToolBox ref="toolBoxRef" />
    <!-- <MapToolBoxNew /> -->
    <MapContextMenu @removeFeature="deleteFeature" />
    <MapPlot v-if="mapInited" :map="mapInstance" />
  </CommonMap>
</template>

<style lang="scss" scoped>
</style>
