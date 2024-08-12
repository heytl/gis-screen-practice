<template>
  <div id="root">
    <div id="container"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, getCurrentInstance } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { shallowRef } from 'vue'
// window._AMapSecurityConfig = {
//   securityJsCode: '4217074f62daa84bdc85d910c939a325'
// }
const map = shallowRef(null)
const { ctx } = getCurrentInstance()
const _this = ctx

let AMap = ref() // map 实例

const initMap = () => {
  AMapLoader.load({
    key: '75ab559ad3fe011964965fc880042eba', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MouseTool'], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    Loca: {
      version: '2.0.0'
    }
  })
    .then((res) => {
      AMap.value = res
      // 上来就显示的中心点  北京 116.397, 39.918
      var lnglat = new res.LngLat(102.73736, 30.596287)
      map.value = new res.Map('container', {
        //设置地图容器id
        viewMode: '3D', //是否为3D地图模式
        zoom: 6, //初始化地图级别
        mapStyle: 'amap://styles/darkblue', //设置地图的显示样式
        center: lnglat //初始化地图中心点位置
      })
      // 地图是否可拖拽和缩放
      map.value.setStatus({
        dragEnable: true, // 是否可拖拽
        zoomEnable: true // 是否可缩放
      })
      // 叠加行政区
      addXzq()
    })
    .catch((e) => {
      console.log('error', e)
    })
}

function addXzq() {
  const disProvince = new AMap.value.DistrictLayer.Province({
    zIndex: 12,
    adcode: [510000],
    depth: 0,
    styles: {
      fill: function (properties) {
        // properties为可用于做样式映射的字段，包含
        // NAME_CHN:中文名称
        // adcode_pro
        // adcode_cit
        // adcode
        var adcode = properties.adcode
        return 'rgba(0,0,0,0)'
      },
      'stroke-width': 4,
      'province-stroke': '#02e3ff'
      // 'city-stroke': '#4f9dd6', // 中国地级市边界
      // 'county-stroke': '#12e3ff' // 中国区县边界
    }
  })

  disProvince.setMap(map.value)

  const disCity = new AMap.value.DistrictLayer.Province({
    zIndex: 12,
    adcode: [510000],
    depth: 1,
    styles: {
      fill: function (properties) {
        // properties为可用于做样式映射的字段，包含
        // NAME_CHN:中文名称
        // adcode_pro
        // adcode_cit
        // adcode
        var adcode = properties.adcode
        return 'rgba(0,0,0,0)'
      },
      'stroke-width': 2,
      'province-stroke': '#02e3ff',
      'city-stroke': '#027af9' // 中国地级市边界
      // 'county-stroke': 'rgba(0,0,0,0)' // 中国区县边界
    }
  })

  disCity.setMap(map.value)
}

onMounted(() => {
  initMap()
})
</script>

<style lang="scss">
#container {
  width: 100%;
  height: 100%;
}

#root {
  width: 100%;
  height: 100%;
}
</style>
