<template>

</template>

<script setup lang="ts">
//导入ECharts
import * as echarts from 'echarts'
//导入自定义的openlayers.echart模块
import ADLayer from '@/plugins/ol-echarts/openlayers.echart.js'
import { inject, onMounted, ref } from 'vue';
import useMapCurveLine from '../hooks/useMapCurveLine';
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { Icon, Stroke, Style } from 'ol/style'
import starIcon from '@/assets/image/map/marker/star.png'
import normalIcon from '@/assets/image/map/marker/triangle.png'


const { getLinesEchartsOption, getCurveFeatures, getPointFeatures } = useMapCurveLine()
// echarts 流光线效果图层
const adLayer = ref(null)
// 获取ol地图
const map = inject('map')


const styles = {
  star: new Style({
    image: new Icon({
      anchor: [0.5, 0.5],
      src: starIcon
    })
  }),
  normal: new Style({
    image: new Icon({
      anchor: [0.5, 1],
      scale: 0.8,
      src: normalIcon
    })
  }),
  tinLine: new Style({
    stroke: new Stroke({
      color: 'rgba(240, 216, 58, 0.63)',
      width: 3
    })
  })
}
const styleFunction = (feature) => {
  const type = feature.get('type')
  return styles[type] || styles['normal']
}
// 创建点图层
const pointsLayer = new VectorLayer({
  // visible: props.visible,
  zIndex: 20,
  source: new VectorSource(),
  style: styleFunction
})

const lineLayer = new VectorLayer({
  zIndex: 11,
  source: new VectorSource(),
  style: styles['tinLine']
})


onMounted(() => {
  // @ts-ignore
  map?.addLayer(lineLayer)
  // @ts-ignore
  map?.addLayer(pointsLayer)
  loadLayer()
})

// 图层加载数据
function loadLayer() {
  // 矢量线图层
  lineLayer.getSource().clear()
  lineLayer.getSource().addFeatures(getCurveFeatures())
  // 点图层
  pointsLayer.getSource().clear()
  pointsLayer.getSource().addFeatures(getPointFeatures())

  clearADLayer()
  // 流动效果
  adLayer.value = new ADLayer(getLinesEchartsOption(), map, echarts)
  adLayer.value.render()
}

// 清除流光线
function clearADLayer() {
  try {
    if (adLayer.value) adLayer.value.clear()
    adLayer.value = null
  } catch { }
}

</script>

<style lang="scss" scoped></style>