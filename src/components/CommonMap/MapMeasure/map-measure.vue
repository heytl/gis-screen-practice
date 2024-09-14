<template>
  <div>
    <MapDraw
      ref="draw"
      :brush="brush"
      :effect="effect"
      :type="drawType"
      manual
      @ready="init"
      @drawstart="handleDrawStart"
      @drawend="handleDrawEnd"
      @typeChange="handleTypeChange"
    />
    <MapHtml
      v-for="(item, index) in measures"
      :key="index"
      class="my-map-measure__tip"
      :class="`is-${theme}`"
      positioning="bottom-center"
      :position="item.position"
      :offset="[0, -7]"
    >
      <span v-html="item.content" />
      <el-icon class="my-map-measure__delete el-icon-delete" @click="handleDelete(item, index)">
        <Delete />
      </el-icon>
    </MapHtml>
    <MapHtml
      v-if="helpTipPosition && !disabled"
      ref="helpTooltip"
      class="my-map-measure__help"
      :class="`is-${theme}`"
      :offset="[15, 0]"
      positioning="center-left"
      :position="helpTipPosition"
    >
      {{ helpTip }}
    </MapHtml>
    <MapHtml v-if="measureTipPosition" class="my-map-measure__tip" :class="`is-${theme}`" :position="measureTipPosition" :offset="[0, -15]" positioning="bottom-center">
      <span v-html="measureTip" />
    </MapHtml>
  </div>
</template>
<script>
/**
 * 测量组件
 * @module $ui/map/my-map-measure
 */
import MapDraw from '../MapDraw/map-draw.vue'
import MapHtml from '../MapHtml/map-html.vue'
import { Delete } from '@element-plus/icons-vue'
import { getArea, getLength } from 'ol/sphere'
import { unByKey } from 'ol/Observable'

// 画笔默认样式
const defaultBrush = {
  fill: 'rgba(64,158,255,0.2)',
  stroke: {
    color: 'rgba(64,158,255,0.7)',
    width: 2,
    lineDash: [10, 10]
  },
  circle: {
    radius: 5,
    stroke: {
      width: 2,
      color: '#409eff'
    }
  }
}
export default {
  name: 'MapMeasure',
  components: {
    MapDraw,
    MapHtml,
    Delete
  },
  inject: ['map'],
  /**
   * 属性参数
   * @member props
   * @property {string} [type=line] 测量类型，距离或面积，支持 'line', 'area'
   * @property {boolean} [disabled] 禁用
   * @property {string} [theme=light] 主题风格
   * @property {string} [startTip] 开始的帮助提示文本
   * @property {string} [endTip] 结束的帮助提示文本
   * @property {object|function} [brush] 画笔样式配置
   * @property {object|function} [effect] 图形样式配置
   */
  props: {
    // 测量类型，距离或面积
    type: {
      type: String,
      default: 'line',
      validator(val) {
        return ['line', 'area'].includes(val)
      }
    },
    disabled: Boolean,
    theme: {
      type: String,
      default: 'light',
      validator(val) {
        return ['light', 'dark'].includes(val)
      }
    },
    startTip: {
      type: String,
      default: '单击确定起点'
    },
    endTip: {
      type: String,
      default: '单击继续，双击结束'
    },
    brush: {
      type: [Object, Function],
      default() {
        return defaultBrush
      }
    },
    effect: [Object, Function]
  },
  data() {
    return {
      helpTipPosition: null,
      helpTip: this.startTip,
      measureTip: null,
      measureTipPosition: null,
      measureTipOffset: [0, -15],
      changeListener: null,
      measures: [],
      value: 0
    }
  },
  computed: {
    drawType() {
      return {
        line: 'LineString',
        area: 'Polygon'
      }[this.type]
    }
  },
  watch: {
    disabled(val) {
      val ? this.finish() : this.$refs.draw.draw()
    }
  },
  beforeUnmount() {
    this.$refs.draw && this.$refs.draw.finish()
    if (this.map) {
      this.map.un('pointermove', this.handlePointerMove)
    }
  },
  methods: {
    init(draw) {
      const map = this.map
      map.on('pointermove', this.handlePointerMove)
      if (!this.disabled) {
        draw.draw()
      }
    },
    formatLength(line) {
      const length = (this.value = getLength(line, {
        projection: this.map?.getView()?.getProjection()
      }))
      let output
      if (length > 100) {
        output = `${Math.round((length / 1000) * 100) / 100} ` + `km`
      } else {
        output = `${Math.round(length * 100) / 100} ` + `m`
      }
      return output
    },
    formatArea(polygon) {
      const area = (this.value = getArea(polygon, {
        projection: this.map?.getView()?.getProjection()
      }))
      let output
      if (area > 10000) {
        output = `${Math.round((area / 1000000) * 100) / 100} ` + `km<sup>2</sup>`
      } else {
        output = `${Math.round(area * 100) / 100} ` + `m<sup>2</sup>`
      }
      return output
    },
    handlePointerMove(e) {
      this.helpTipPosition = e.coordinate
    },
    handleDrawStart(evt) {
      this.value = 0
      const geometry = evt.feature.getGeometry()
      let coordinate = evt.coordinate
      let output
      this.changeListener = geometry.on('change', (evt) => {
        const geom = evt.target
        if (this.type === 'line') {
          output = this.formatLength(geom)
          coordinate = geom.getLastCoordinate()
        } else if (this.type === 'area') {
          output = this.formatArea(geom)
          coordinate = geom.getInteriorPoint().getCoordinates()
        }
        this.helpTip = this.endTip
        this.$nextTick(() => {
          this.measureTipPosition = coordinate
          this.measureTip = output
        })
      })
    },
    handleDelete(item, index) {
      this.$refs.draw.removeFeature(item.feature)
      this.measures.splice(index, 1)
    },
    handleDrawEnd({ feature }) {
      this.changeListener && unByKey(this.changeListener)
      this.measures.push({
        feature,
        position: this.measureTipPosition,
        content: this.measureTip
      })
      this.$nextTick(() => {
        this.helpTip = this.startTip
        this.helpTipPosition = null
      })
      setTimeout(() => {
        this.measureTipPosition = null
      }, 0)
      /**
       * 测量结束时触发
       * @event end
       * @param {number} value 测量结果，单位 米 或 平方米
       */
      this.$emit('end', this.value)
    },
    handleTypeChange() {
      if (!this.disabled) {
        this.$refs.draw.finish()
        this.$refs.draw.draw()
      }
    },
    /**
     * 清空画板
     * @method clear
     */
    clear() {
      this.$refs.draw && this.$refs.draw.clear()
      this.measures = []
    },
    /**
     * 结束绘画和编辑
     */
    finish() {
      this.$refs.draw.finish()
      this.measureTipPosition = null
    }
  }
}
</script>

<style scoped>
.my-map-measure__help,
.my-map-measure__tip {
  background: hsla(0, 0%, 100%, 0.9);
  border-radius: 2px;
  color: #5f6477;
  -webkit-box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  padding: 5px 8px;
}

.my-map-measure__help.is-dark,
.my-map-measure__tip.is-dark {
  background: rgba(30, 30, 30, 0.95);
  color: #ccc;
}

.my-map-measure__tip:before {
  border-top: 6px solid hsla(0, 0%, 100%, 0.9);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: '';
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.my-map-measure__tip.is-dark:before {
  border-top: 6px solid rgba(30, 30, 30, 0.95);
}

.my-map-measure__delete {
  color: #faad14;
  margin-left: 5px;
  cursor: pointer;
}

.my-map-measure__delete:hover {
  opacity: 0.8;
}
</style>
