import { onMounted, ref, watch } from 'vue'
import DragRotate from 'ol/interaction/DragRotate'
import DragPan from 'ol/interaction/DragPan'
import { always, altKeyOnly, mouseOnly } from 'ol/events/condition'
import { Graticule } from 'ol/layer'
export const useMapSetting = (map) => {
  onMounted(() => {
    addCustomInteraction()
    addGraticule()
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
    // map.addInteraction(dragPan)
    map.addInteraction(dragRotate)
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
    map.addLayer(graticule)
  }
}
