import mockData from '@/views/openlayers/demo/service/mockData.js'
import * as turf from '@turf/turf'
import GeoJSON from 'ol/format/GeoJSON'
import { createCurvePoints } from '@/utils/map/map.js'
import { onMounted, ref } from 'vue'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
export default function () {
  const curveLines = ref([])
  // 获取数据
  const getData = () => {
    return mockData.BJCoordsData
  }

  // 获取贝塞尔曲线
  function getCurveLines(data) {
    const curveLines = []
    data.forEach((item) => {
      // 转曲线 转坐标
      let line = bezierLine(item.coords).map((item) => fromLonLat(item))
      curveLines.push(line)
    })
    return curveLines
  }

  /**
   * 将俩点坐标[起点,终点]转为曲线，返回二维坐标数组
   * @param coordinates
   * @returns
   */
  function bezierLine(coordinates) {
    const distance = turf.distance(coordinates[0], coordinates[1], {
      units: 'degrees'
    })
    const line = createCurvePoints(coordinates[0], coordinates[1], distance / 10, 120, 0.1)
    return line
  }

  // 获取 echarts 需要的 Option
  function getLinesEchartsOption() {
    const series = []
    series.push({
      name: 'name',
      type: 'lines',
      zlevel: 100,
      polyline: true,
      effect: {
        show: true,
        period: 6,
        constantSpeed: 100,
        trailLength: 0.7,
        color: '#fff',
        symbolSize: 2
      },
      lineStyle: {
        color: 'rgba(0, 156, 255, 1)',
        width: 0,
        opacity: 0.4
      },
      data: curveLines.value
    })

    return {
      series: series
    }
  }

  // 获取线要素
  function getCurveFeatures() {
    const lines = curveLines.value.map((line) => turf.lineString(line))
    const lineColletion = turf.featureCollection(lines)
    // 返回Features
    return new GeoJSON().readFeatures(lineColletion)
  }

  // 获取点要素
  function getPointFeatures() {
    const data = getData()
    const features = []
    const feature = new Feature({
      geometry: new Point(fromLonLat(data[0].coords[0])),
      type: 'star',
      attribute: data[0]
    })
    features.push(feature)

    data.forEach((item) => {
      const coords = item.coords
      const feature = new Feature({
        geometry: new Point(fromLonLat(coords[1])),
        type: 'normal',
        attribute: item
      })
      features.push(feature)
    })

    return features
  }

  onMounted(() => {
    curveLines.value = getCurveLines(getData())
    getPointFeatures()
  })

  return {
    getLinesEchartsOption,
    getCurveFeatures,
    getPointFeatures
  }
}
