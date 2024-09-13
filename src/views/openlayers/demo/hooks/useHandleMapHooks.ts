// import { ref } from 'vue'
export const useHandleMap = () => {
  // const mapRef = ref(null) // 通过 模板ref 绑定子组件

  function mapPointerMove(evt) {
    if (evt.dragging) {
      return
    }
    const olMap = evt.map
    const pixel = olMap.getEventPixel(evt.originalEvent)
    // 获取地图上的feature
    const feature = olMap.forEachFeatureAtPixel(pixel, function (feature) {
      return feature
    })

    if (feature) {
      if (feature.get('type') === 'terminal-points') {
        olMap.getTargetElement().style.cursor = 'pointer'
      }
    } else {
      olMap.getTargetElement().style.cursor = 'auto'
    }
  }

  function mapClick(evt) {
    console.log('地图点击')

    const olMap = evt.map

    const feature = olMap.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature
    })

    if (feature) {
      switch (feature.get('type')) {
        case 'terminal-points':
          break
        default:
          break
      }
    }
  }
  return {
    mapPointerMove,
    mapClick,
  }
}
