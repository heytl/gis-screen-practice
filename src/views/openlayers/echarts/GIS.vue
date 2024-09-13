<script lang="ts" setup>
import 'ol/ol.css'
import { Map, View, Feature, MapBrowserEvent } from 'ol'
import { onMounted, onUnmounted, ref } from 'vue'
import { XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { useGeographic } from 'ol/proj'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import markerIcon from '@/assets/vue.svg'
import EchartsDemo from '@/views/openlayers/echarts/EchartsDemo.vue'

const coords = [104.06771001652146, 30.55203564754484]
const mapRef = ref()
const dialogVisible = ref(false)
useGeographic()

const xtUrl =
  'https://tiles1.geovisearth.com/base/v1/vec/{z}/{x}/{y}?format=png&tmsIds=w&token=fba2a03dd80a9c4701f54d7519c9e1ded2e0e3675a2d72b6ecba92b63d64530c'
const basemapLayer = new TileLayer({
  source: new XYZ({
    crossOrigin: '',
    url: xtUrl
  })
})

const map = new Map({
  layers: [basemapLayer],
  view: new View({
    center: coords,
    zoom: 16
  })
})

const source: VectorSource = new VectorSource()

const vectorLayer = new VectorLayer({
  source: source,
  style: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: markerIcon
    })
  })
})

// 鼠标停留事件处理
const _hoverHandler = (evt: MapBrowserEvent<MouseEvent>) => {
  if (evt.dragging) {
    return
  }
  const pixel = map.getEventPixel(evt.originalEvent)
  const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature)
  if (feature) {
    // 有要素
    // console.log(feature)
    map.getTargetElement().style.cursor = 'pointer'
  } else {
    map.getTargetElement().style.cursor = 'auto'
  }
}

// 鼠标点击
const _clickHander = (evt: MapBrowserEvent<MouseEvent>) => {
  if (evt.dragging) {
    return
  }
  const pixel = map.getEventPixel(evt.originalEvent)
  const feature = map.forEachFeatureAtPixel(pixel, (feature) => feature)
  if (feature) {
    // 有要素
    console.log('点击了要素')
    dialogVisible.value = true
  }
}

onMounted(() => {
  map.setTarget(mapRef.value)
  map.addLayer(vectorLayer)
  map.on('pointermove', _hoverHandler)
  map.on('singleclick', _clickHander)
  source.addFeature(
    new Feature({
      geometry: new Point(coords)
    })
  )
})

onUnmounted(() => {
  map.setTarget(undefined)
})
</script>

<template>
  <div id="map" ref="mapRef">
    <div class="rectangle"></div>
  </div>

  <el-dialog v-model="dialogVisible" title="Echarts Demo" width="30%">
    <div style="height: 400px">
      <EchartsDemo />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  background-color: bisque;

  .rectangle {
    position: absolute;
    width: 40%;
    height: 8%;
    background: rgb(255, 0, 0, 0.5);
    top: 2%;
    z-index: 10;
    left: 30%;
    border-radius: 5px;
  }
}
</style>
