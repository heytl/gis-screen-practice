<template>
  <div v-if="false" />
  <MapHtml
    v-for="(item, index) in measures"
    :key="index"
    class="my-map-measure__tip"
    :class="`is-${theme}`"
    positioning="bottom-center"
    :position="item.position"
    :offset="[0, -7]"
  >
    <div class="my-map-measure__Div">
      <el-icon class="my-map-measure__delete el-icon-delete" @click="handleDelete(item, index)">
        <Delete />
      </el-icon>
    </div>
  </MapHtml>
</template>

<script>
import { useHandleMapFence } from '@/views/business/home/hooks/useHandleMapFence'
import LayerVector from 'ol/layer/Vector'
import SourceVector from 'ol/source/Vector'
import Draw, { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import { Point, Polygon } from 'ol/geom'
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style'
import parseStyle from './style.js'
import { Delete } from '@element-plus/icons-vue'
import MapHtml from '../MapHtml/map-html.vue'
// import Feature from 'ol/Feature'
// import { fromCircle } from 'ol/geom/Polygon'
// import Ar from "../../../../dist/js/MapToolkit-ddfbdfec";

// 默认图形样式
const defaultEffect = {
  // 填充
  fill: 'rgba(255, 255, 255, 0.5)',
  Munit: null,
  // 边界
  stroke: {
    color: 'red',
    width: 2
  }
}

const defaultText = {
  // 文本
  text: {
    text: '文本内容',
    font: '14px',
    fill: '#409eff',
    stroke: {
      width: 1,
      color: '#fff'
    },
    rotation: 0,
    backgroundFill: 'rgba(255,255,255,0.8)',
    padding: [5, 5, 2.5, 5],
    backgroundStroke: {
      width: 2,
      color: '#409eff'
    }
  }
}

/**
 * 图形绘制组件
 */
export default {
  name: 'MapDrawGraph',
  components: { Delete, MapHtml },
  inject: ['map'],
  props: {
    shape: {
      type: String,
      default: 'None'
    },
    // 图形样式
    graphEffect: {
      type: [Object, Function],
      default() {
        return defaultEffect
      }
    },
    // 文本样式
    textEffect: {
      type: [Object, Function],
      default() {
        return defaultText
      }
    },
    // identifyObject: {
    //   type: String
    // },
    showArray: {
      type: Array
    },
    typeShow: {
      type: Number
    }
  }, // 获取地图组件的viewModel
  emits: ['getGeoArray', 'changeShape', 'clearIdentifyObject'],
  data() {
    return {
      source: new SourceVector({
        wrapX: false // 禁止横向无限重复（底图渲染的时候会横向无限重复）
      }),
      measures: [],
      theme: 'light'
    }
  },
  // computed:{
  //   GeoArray(){
  //     return JSON.parse(identifyObject)
  //   }
  // },
  watch: {
    shape(val) {
      if (val) {
        console.log(val, 'val,val')
        // 清空数据
        // this.layer.getSource().clear();
        this.addInteraction()
      }
    }
  },
  mounted() {
    this.layer = new LayerVector({
      source: this.source,
      zIndex: 100
    })
    this.$nextTick(() => {
      const map = this.map
      map.addLayer(this.layer)
    })
    const { createFeatures } = useHandleMapFence()
    if (this.showArray.length > 0 && this.typeShow !== -1) {
      console.log(this.showArray.length > 0 && this.typeShow, this.showArray, this.typeShow, 'this.showArray.length>0&&this.typeShow')
      const json = [
        {
          identifyObject: JSON.stringify(this.showArray),
          fenceType: this.typeShow
        }
      ]
      setTimeout(() => {
        const aa1 = createFeatures(json)
        this.layer.getSource().addFeatures(aa1)
      }, 200)
    }
  },
  methods: {
    drawingEnd(evt) {
      const geo = evt.feature.getGeometry()
      const type = geo.getType() //获取类型
      console.log(type)
      //根据不同的类型执行不同的操作
      const handle = {
        Circle: () => {
          //获取中心点和半径
          const center = geo.getCenter()
          const radius = geo.getRadius()
          //半径换成米单位
          const radiusM = (radius * this.getMetersPerUnit()).toFixed(6) - 0
          const array = [...center, radiusM]
          this.$emit('getGeoArray', array)
          this.measures.push({
            feature: evt.feature,
            position: center
          })
        },
        Polygon: () => {
          //获取坐标点
          const points = geo.getCoordinates()
          // let array = [...points]
          this.$emit('getGeoArray', points)
          this.measures.push({
            feature: evt.feature,
            position: points[0][0]
          })
        },
        LineString: () => {
          const points = geo.getCoordinates()
          const array = [...points]
          this.$emit('getGeoArray', array)
          this.measures.push({
            feature: evt.feature,
            position: points[0]
          })
        }
      }
      if (handle[type]) handle[type]()
      this.closeDraw()
      this.$emit('changeShape')
    },
    addInteraction() {
      console.log(this.layer.getSource(), 'this.layer.getSource()')
      const map = this.map
      if (this.draw) {
        map.removeInteraction(this.draw)
      }
      if (this.shape !== 'None') {
        let geometryFunction
        let type = 'Circle'

        if (this.shape === 'Square') {
          // 方形
          geometryFunction = createRegularPolygon(4)
        } else if (this.shape === 'Rectangle') {
          // 矩形
          geometryFunction = createBox()
        } else if (this.shape === 'Hexagram') {
          geometryFunction = function (coordinates, geometry) {
            //中心点
            const center = coordinates[0]
            //鼠标点击的另一个点
            const last = coordinates[1]
            const dx = center[0] - last[0]
            const dy = center[1] - last[1]
            //半径
            const radius = Math.sqrt(dx * dx + dy * dy)
            //旋转的角度
            const rotation = Math.atan2(dy, dx)
            //用来记录顶点坐标的数组
            const newCoordinates = []
            //顶点个数
            const numPoints = 12
            for (let i = 0; i < numPoints; ++i) {
              //顶点相对转过的角度
              const angle = rotation + (i * 2 * Math.PI) / numPoints
              //确定凸顶点和凹顶点
              const fraction = i % 2 === 0 ? 1 : 0.58
              //计算顶点的坐标
              const offsetX = radius * fraction * Math.cos(angle)
              const offsetY = radius * fraction * Math.sin(angle)
              newCoordinates.push([center[0] + offsetX, center[1] + offsetY])
            }
            newCoordinates.push(newCoordinates[0].slice())
            if (!geometry) {
              geometry = new Polygon([newCoordinates])
            } else {
              geometry.setCoordinates([newCoordinates])
            }
            return geometry
          }
        } else if (this.shape === 'LineString' || this.shape === 'Arrow') {
          type = 'LineString'
        } else if (this.shape === 'Text') {
          type = 'Point'
        } else if (this.shape === 'Polygon') {
          type = 'Polygon'
        }

        this.draw = new Draw({
          source: this.source,
          type,
          geometryFunction
        })

        this.draw.on('drawend', (event) => {
          this.getStyle(event.feature) && event.feature.setStyle(this.getStyle(event.feature))
          this.drawingEnd(event)
        })

        map.addInteraction(this.draw)
      }
    },
    closeDraw() {
      this.map.removeInteraction(this.draw)
    },
    // 获取当前样式
    getStyle(feature) {
      let style
      switch (this.shape) {
        case 'Text':
          style = parseStyle(this.textEffect)
          break
        case 'Arrow':
          style = this.arrowStyleFunction(feature)
          break
        default:
          style = parseStyle(this.graphEffect)
          break
      }
      return style
    },
    /**
     * 清除要素
     **/
    clear() {
      this.source && this.source.clear()
    },
    //弹出删除层
    handleDelete(item, index) {
      this.layer.getSource().removeFeature(item.feature)
      this.measures.splice(index, 1)
      this.$emit('clearIdentifyObject')
    },
    /**
     * 获取每个投影单位代表的距离米
     * @method getMetersPerUnit
     * @return {*|number|number}
     */
    getMetersPerUnit() {
      const map = this.map
      if (!map) return 0
      const view = map.getView()
      const projection = view.getProjection()
      return projection.getMetersPerUnit()
    },
    /**
     * 撤回上一次点
     **/
    redraw() {
      if (this.draw) {
        this.draw.removeLastPoint()
      }
    },
    /**
     * 图层样式函数
     * 根据属性渲染符号
     */
    arrowStyleFunction(feature, resolution) {
      console.log(resolution)
      const geometry = feature.getGeometry()
      const styles = []
      const lineStyle = parseStyle(this.graphEffect)
      styles.push(lineStyle)

      const strokeColor = lineStyle.getStroke().getColor()
      const strokeWidth = lineStyle.getStroke().getWidth()
      geometry.forEachSegment((start, end) => {
        const dx = end[0] - start[0]
        const dy = end[1] - start[1]
        const rotation = Math.atan2(dy, dx)
        styles.push(
          new Style({
            geometry: new Point(end),
            image: new Icon({
              color: strokeColor, // 箭头颜色与线段保持一致
              // src: require('@/assets/image/map/arrow.png'),
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='240' height='240'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E", // 图标
              scale: (strokeWidth * 12) / 240, // 计算箭头比例，保持和线宽度同步变化
              anchor: [0.6, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          })
        )
      })
      return styles
    },
    textStyleFunction(feature) {
      const style = new Style({
        image: new Circle({
          radius: 3,
          stroke: new Stroke({
            color: '#fff'
          }),
          fill: new Fill({
            color: '#F00'
          })
        }),
        text: new Text({
          fill: new Fill({
            color: 'rgba(0,0,0,1)'
          }),
          stroke: new Stroke({
            color: 'rgba(255,255,255,1)',
            width: 3
          })
        })
      })
      style.getText().setText(feature.get('name'))
      return this.createRoundStyle(feature.get('name'))
    },
    /**
     * 创建圆角标注
     * 原理：根据文本长度绘制圆角 canvas 背景，作为
     * @param text
     * return Style
     */
    createRoundStyle(text) {
      const fontStyle = '14px Microsoft YaHei' // 文字字体
      let canvas, context

      canvas = document.createElement('canvas')
      context = canvas.getContext('2d')
      context.font = fontStyle || '12px' // 设置字体样式，当然，也可以在这里给一个默认值
      const dimension = context.measureText(text).width // 计算文本宽度
      canvas.width = dimension + 13
      canvas.height = 22
      let x = 0,
        y = 0,
        w = canvas.width,
        h = canvas.height,
        r = 4
      if (w < 2 * r) r = w / 2
      if (h < 2 * r) r = h / 2
      context.beginPath()
      context.moveTo(x + r, y)
      context.arcTo(x + w, y, x + w, y + h, r)
      context.arcTo(x + w, y + h, x, y + h, r)
      context.arcTo(x, y + h, x, y, r)
      context.arcTo(x, y, x + w, y, r)
      context.closePath()
      context.fillStyle = '#FFF'
      context.fill()

      return new Style({
        image: new Icon({
          img: canvas,
          imgSize: [w, h],
          anchorOrigin: 'bottom-left', // 原点位置
          anchorXUnits: 'pixels', // anchor单位为 'pixels'
          anchorYUnits: 'pixels', // anchor单位为 'pixels'
          anchor: [w / 2, h / 2] // x,y的锚点偏移值[x,y]
        }),
        text: new Text({
          // offsetX: 16,
          offsetY: 1,
          text, // 文本内容
          textAlign: 'center', // 对齐方式（标注文字相对于符号）
          textBaseline: 'middle', // 文本基线
          font: fontStyle,
          fill: new Fill({ color: '#000' })
        })
      })
    }
  }
}
</script>

<style scoped>
.my-map-measure__delete {
  color: #faad14;
  font-size: 25px;
  font-weight: 800;
  margin-left: 5px;
  cursor: pointer;
}

.my-map-measure__delete:hover {
  opacity: 1;
}
</style>
