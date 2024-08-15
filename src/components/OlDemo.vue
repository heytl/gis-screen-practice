<script lang="ts" setup>
import 'ol/ol.css'
import { Map, View, Feature, MapBrowserEvent } from 'ol'
import { onMounted, onUnmounted, ref } from 'vue'
import { XYZ } from 'ol/source'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { useGeographic } from 'ol/proj'
import { Circle, Point, LineString } from 'ol/geom'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import Icon from 'ol/style/Icon'
import markerIcon from '../assets/vue.svg'
import { METERS_PER_UNIT } from 'ol/proj/Units'
import { routePoints } from '../assets/route.ts'
import * as turf from '@turf/turf'
import GeoJSON from 'ol/format/GeoJSON.js'
import { createCurvePoints } from '../utils/ol-utils/map.js'
const coords = [121.45495613864011, 31.210585926692985]
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

// 离线XYZ谷歌影像底图
const offlineSatelliteLayer = new TileLayer({
  zIndex: 1,
  source: new XYZ({
    crossOrigin: '',
    url: 'http://localhost/gis/Google_Satellite_0_8/{z}/{x}/{y}.png'
  })
})

// POI离线XYZ谷歌影像底图
const poiSatelliteLayer = new TileLayer({
  zIndex: 10,
  source: new XYZ({
    crossOrigin: '',
    url: 'http://localhost/gis/Google_Satellite_POI/{z}/{x}/{y}.png'
  })
})

const map = new Map({
  layers: [poiSatelliteLayer, offlineSatelliteLayer],
  view: new View({
    center: coords,
    zoom: 8
  })
})

const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    src: markerIcon
  })
})

const createCircleStyle = (radius: number) => {
  // 将半径从米转换为地图投影单位
  let radiusInMapUnits = radius / METERS_PER_UNIT.degrees
  return new Style({
    geometry: (feature) => {
      console.log('feature', feature)
      const coords = feature?.getGeometry()?.getCoordinates()
      return new Circle(coords, radiusInMapUnits)
    },
    stroke: new Stroke({
      color: 'rgba(180, 180, 180, 0.9)',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(141, 86, 81, 0.3)'
    })
  })
}
const circleStyle = new Style({
  geometry: (feature) => {
    console.log('feature', feature)
    const coords = feature?.getGeometry()?.getCoordinates()
    return new Circle(coords, 0.1)
  },
  stroke: new Stroke({
    color: 'rgba(180, 180, 180, 0.9)',
    width: 1
  }),
  fill: new Fill({
    color: 'rgba(141, 86, 81, 0.3)'
  })
})

// 线样式
const lineStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(49, 227, 255, 1)',
    width: 2,
    lineDash: [2, 8] // 虚线样式
  })
})
// 线样式
const redLineStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(180, 105, 117, 1)',
    width: 2,
    lineDash: [2, 8] // 虚线样式
  })
})
const source: VectorSource = new VectorSource()

const vectorLayer = new VectorLayer({
  zIndex: 20,
  source: source,
  style: [iconStyle, createCircleStyle(10000), createCircleStyle(20000), createCircleStyle(80000)]
})

const lineLayer = new VectorLayer({
  zIndex: 20,
  source: new VectorSource(),
  style: (feature) => {
    const styles = [lineStyle]
    // 为每个点添加圆点样式
    const coords = feature?.getGeometry()?.getCoordinates()
    coords.forEach((coord) => {
      styles.push(
        new Style({
          geometry: new Point(coord),
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color: 'rgba(63, 215, 245, 1)' })
          })
        })
      )

      styles.push(
        new Style({
          geometry: new Point(coord),
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: 'rgba(63, 215, 245, 0.3)' })
          })
        })
      )
    })
    return styles
  }
})

const otherLayer = new VectorLayer({
  zIndex: 20,
  source: new VectorSource()
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

// 添加折线轨迹
const addLine = () => {
  lineLayer?.getSource()?.addFeature(
    new Feature({
      geometry: new LineString(routePoints)
    })
  )
}

/**
 * 将俩点坐标[起点,终点]转为曲线，返回二维坐标数组
 * @param coordinates
 * @returns
 */
function bezierLine(coordinates: number[][]) {
  const distance = turf.distance(coordinates[0], coordinates[1], {
    units: 'degrees'
  })
  const line = createCurvePoints(coordinates[0], coordinates[1], distance / 5, 90, 0.05)
  return line
}

// 添加曲线
const addArcLine = () => {
  // 使用贝塞尔曲线生成工具创建一条曲线
  let line = turf.lineString(bezierLine([coords, [122.78775018632945, 31.374432991681047]]))
  const curvedLine = new GeoJSON().readFeature(line)
  // 设置曲线的样式
  curvedLine.setStyle(redLineStyle)
  // 将曲线特征添加到地图的图层中
  otherLayer?.getSource()?.addFeature(curvedLine)
}

onMounted(() => {
  map.setTarget(mapRef.value)
  map.addLayer(vectorLayer)
  map.addLayer(lineLayer)
  map.addLayer(otherLayer)
  map.on('pointermove', _hoverHandler)
  map.on('singleclick', _clickHander)
  source.addFeature(
    new Feature({
      geometry: new Point(coords)
    })
  )
  addLine()
  addArcLine()
})

onUnmounted(() => {
  map.setTarget(undefined)
})
</script>

<template>
  <div id="map" ref="mapRef"></div>
</template>

<style lang="scss">
#map {
  width: 100%;
  height: 100%;
  background-color: bisque;
}
</style>
