<template>
  <!--地图选择绘制示例-->
  <map-draw ref="selectionDraw" :type="mapToolBoxData.selectionType" :effect="mapToolBoxData.selectionEffect"
    @drawend="selectionDrawEnd" manual></map-draw>
  <!--地图测量工具示例-->
  <map-measure ref="measure" :disabled="mapToolBoxData.measureDisable" :type="mapToolBoxData.measureType"></map-measure>
  <!--地图图形绘制示例-->
  <map-draw-graph ref="graph" :shape="graph.type" :graph-effect="getGraphEffect" :text-effect="getTextEffect"
    @drawend="graphDrawEnd"></map-draw-graph>
  <!--地图图标绘制示例-->
  <map-draw ref="iconDraw" type="Point" :brush="mapToolBoxData.iconBrush" :effect="mapToolBoxData.iconBrush"
    @drawend="iconDrawEnd" manual></map-draw>

  <!--工具箱示例-->
  <div class="mapToolBox ol-unselectable" ref="mapToolBox">
    <div class="mapToolBoxIn" @click="toggleBox">
      <el-icon>
        <Tools />
      </el-icon>
      <span>工具</span>
    </div>
    <transition name="fade">
      <div class="tool_open_box" v-show="mapToolBoxData.mapToolBoxIn">
        <div v-for="(item, index) in toolData" :key="item.name">
          <p>{{ item.name }}</p>
          <ul>
            <li v-for="itemIn in item.data" @click="mapActive(itemIn, index)" :key="itemIn.name">
              <i class="state" v-if="!!itemIn.select"></i>
              <img :src="itemIn.src" height="42" />
              <span>{{ itemIn.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import MapDraw from '@/components/CommonMap/MapDraw/map-draw.vue'
import MapHtml from '@/components/CommonMap/MapHtml/map-html.vue'
import MapMeasure from '@/components/CommonMap/MapMeasure/map-measure.vue'
import MapDrawGraph from '@/components/CommonMap/MapDrawGraph/map-draw-graph.vue'
import parseStyle from '@/components/CommonMap/MapDraw/style'
import Utils from '@/utils'
import { Tools } from '@element-plus/icons-vue'
import 'ol-plot/dist/ol-plot.css'
import Plot from 'ol-plot'
import { nextTick } from 'vue'

export default {
  name: 'map-toolbox',
  inject: ['map'],
  emits: ['submit', 'selectionDrawEnd', 'showBox'], // 提交事件, 框选/圈选事件
  components: {
    Tools,
    MapDraw,
    MapHtml,
    MapMeasure,
    MapDrawGraph
  },
  props: {
    // 填充颜色
    fillColor: {
      type: String,
      default: 'rgba(255,255,255,0.5)'
    },
    // 边框颜色
    strokeColor: {
      type: String,
      default: '#409eff'
    },
    // 边框宽度
    strokeWidth: {
      type: Number,
      default: 3
    },
    // 文本颜色
    textColor: {
      type: String,
      default: '#409eff'
    },
    // 文本字体大小
    textSize: {
      type: Number,
      default: 14
    }
  },
  computed: {
    olMap() {
      if (this.map) {
        console.log('111');

      }
      return this?.map || null
    },
    // 计算图形样式配置
    getGraphEffect() {
      return {
        // 填充
        fill: this.fillColor,
        // 边界
        stroke: {
          color: this.strokeColor,
          width: this.strokeWidth
        }
      }
    },
    // 计算文本样式配置
    getTextEffect() {
      return {
        // 文本
        text: {
          text: '文本内容', // 文本标注内容
          font: this.textSize + 'px', // 字体大小
          fill: this.textColor, // 字体颜色
          stroke: {
            width: 2, // 字体掩膜宽度
            color: '#fff' // 字体掩膜颜色
          },
          rotation: 0, // 旋转角度
          backgroundFill: this.fillColor, // 背景颜色
          padding: [0.3 * this.textSize, 0.3 * this.textSize, 0.15 * this.textSize, 0.3 * this.textSize], // 背景的padding
          backgroundStroke: {
            width: this.strokeWidth, // 背景边框宽度
            color: this.strokeColor // 背景边框颜色
          }
        }
      }
    }
  },
  mounted() {
    console.log('map', this.map);
    setTimeout(()=>{
      console.log('map', this.map);
      
    }, 5000)
    nextTick(() => {
      console.log('map', this.map);

    })
  },
  data() {
    return {
      map: null,
      isShowSetting: false,
      isShowSettingSearch: false,
      searchKeyword: '',
      searchPoiData: [],
      searchPoiSelectIds: [],
      searchPoiType: 'text',
      searchAround: false,
      searchPoiCenter: null,
      searchPoiRadius: 5000,
      // 图形参数
      graph: {
        type: 'None'
      },
      mapToolBoxData: {
        mapToolBoxIn: false,
        measureDisable: true,
        measureType: 'area',
        selectionDraw: false,
        selectionType: 'Polygon',
        selectionEffect: {
          fill: 'rgba(255, 0, 0, 0.1)',
          stroke: {
            color: '#e5bb1c',
            width: 2,
            lineDash: [5, 3] // 虚线参数：第一个值是虚线小段的长度，第二个值是虚线的间隔
          }
        },
        iconType: 'Point',
        iconBrush: {
          fill: 'rgba(255, 0, 0, 0.5)',
          stroke: {
            color: '#409eff',
            width: 2
          },
          icon: {
            anchor: [0.5, 1],
            scale: 0.8,
            src: new URL('@/assets/image/map/tool/bkry.png', import.meta.url).href,
            rotation: 0 //旋转角度
          }
        }
      },
      toolData: [
        {
          name: '编辑',
          data: [
            // {
            //   name: "提交",
            //   src: new URL("@/assets/image/map/tool/submit.png")
            // },
            {
              name: '截屏',
              src: new URL('@/assets/image/map/tool/printing.png', import.meta.url).href
            }
          ]
        },
        {
          name: '工具',
          data: [
            {
              name: '清屏工具',
              src: new URL('@/assets/image/map/tool/clear.png', import.meta.url).href
            },
            {
              name: '测距',
              src: new URL('@/assets/image/map/tool/ranging.png', import.meta.url).href,
              select: false
            },
            {
              name: '测面',
              src: new URL('@/assets/image/map/tool/side.png', import.meta.url).href,
              select: false
            },
            {
              name: '框选',
              src: new URL('@/assets/image/map/tool/BoxSelection.png', import.meta.url).href,
              select: false
            },
            {
              name: '圈选',
              src: new URL('@/assets/image/map/tool/circle.png', import.meta.url).href,
              select: false
            }
          ]
        },
        {
          name: '画图',
          data: [
            {
              name: '清屏画图',
              src: new URL('@/assets/image/map/tool/clear.png', import.meta.url).href
            },
            {
              name: '箭头',
              src: new URL('@/assets/image/map/tool/arrow.png', import.meta.url).href,
              select: false
            },
            {
              name: '矩形',
              src: new URL('@/assets/image/map/tool/rectangle.png', import.meta.url).href,
              select: false
            },
            {
              name: '圆形',
              src: new URL('@/assets/image/map/tool/circular.png', import.meta.url).href,
              select: false
            },
            {
              name: '橡皮',
              src: new URL('@/assets/image/map/tool/rubber.png', import.meta.url).href
            },
            {
              name: '划线',
              src: new URL('@/assets/image/map/tool/Scribing.png', import.meta.url).href,
              select: false
            },
            {
              name: '文本',
              src: new URL('@/assets/image/map/tool/text.png', import.meta.url).href
            }
          ]
        },
        // {
        //   name: '画笔',
        //   data: [
        //     {
        //       name: '颜色',
        //       src: new URL('@/assets/image/map/tool/color.png', import.meta.url).href
        //     },
        //     {
        //       name: '像素',
        //       src: new URL('@/assets/image/map/tool/px.png', import.meta.url).href
        //     },
        //     {
        //       name: '字体',
        //       src: new URL('@/assets/image/map/tool/font.png', import.meta.url).href
        //     }
        //   ]
        // },
        {
          name: '图标',
          data: [
            {
              name: '清屏图标',
              src: new URL('@/assets/image/map/tool/clear.png', import.meta.url).href
            },
            {
              name: '被困人员',
              src: new URL('@/assets/image/map/tool/bkry.png', import.meta.url).href
            },
            {
              name: '爆炸物',
              src: new URL('/src/assets/image/map/tool/bzw.png', import.meta.url).href
            }
          ]
        },
        {
          name: '态势',
          data: [
            {
              name: '清屏图标',
              src: new URL('@/assets/image/map/tool/clear.png', import.meta.url).href
            },
            {
              name: '直线箭头',
              type: 'AssaultDirection',
              src: new URL('@/assets/image/map/tool/zhixianjiantou.png', import.meta.url).href
            },
          ]
        }
      ]
    }
  },
  methods: {
    getImage(path) {
      const data = new URL(path, import.meta.url).href;
      // const data = new URL("/src/assets/a.png", import.meta.url).href;
      return data;
    },
    toggleBox() {
      this.mapToolBoxData.mapToolBoxIn = !this.mapToolBoxData.mapToolBoxIn
      if (this.mapToolBoxData.mapToolBoxIn) {
        this.$emit('showBox')
      }
    },
    closeBox() {
      this.mapToolBoxData.mapToolBoxIn = false
      this.mapToolBoxData.measureDisable = true
      this.$refs.iconDraw.finish()
      this.$refs.selectionDraw.finish()
    },
    //工具箱方法
    mapActive(type, index) {
      // 清除某一类的所有选中
      const unselectAll = (index) => {
        for (let toolDatum of this.toolData[index].data) {
          toolDatum.select = false
        }
      }
      if (index === 0) {
        switch (type.name) {
          case '提交':
            this.$confirm('确认提交?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.$emit('submit', e)
              })
              .catch((e) => {
                console.log(e)
              })
            break
          case '截屏':
            this.exportMap()
            break
        }
      }
      if (index === 1) {
        this.graph.type = 'None'
        this.$refs.iconDraw.finish()
        unselectAll(2)
        // unselectAll(4)
        switch (type.name) {
          case '清屏工具':
            this.$refs.measure.clear()
            this.$refs.selectionDraw.clear()
            break
          case '测距':
            if (type.select) {
              type.select = false
              this.mapToolBoxData.measureDisable = true
            } else {
              unselectAll(index)
              this.$refs.selectionDraw.finish()
              type.select = true
              this.mapToolBoxData.measureType = 'line'
              this.mapToolBoxData.measureDisable = false
            }
            break
          case '测面':
            if (type.select) {
              type.select = false
              this.mapToolBoxData.measureDisable = true
            } else {
              unselectAll(index)
              this.$refs.selectionDraw.finish()
              type.select = true
              this.mapToolBoxData.measureType = 'area'
              this.mapToolBoxData.measureDisable = false
            }
            break
          case '框选':
            if (type.select) {
              type.select = false
              this.$refs.selectionDraw.finish()
            } else {
              unselectAll(index)
              this.mapToolBoxData.measureDisable = true
              type.select = true
              this.$refs.selectionDraw.finish()
              this.mapToolBoxData.selectionType = 'Polygon'
              this.$refs.selectionDraw.draw()
            }
            break
          case '圈选':
            if (type.select) {
              type.select = false
              this.$refs.selectionDraw.finish()
            } else {
              unselectAll(index)
              this.mapToolBoxData.measureDisable = true
              type.select = true
              this.$refs.selectionDraw.finish()
              this.mapToolBoxData.selectionType = 'Circle'
              this.$refs.selectionDraw.draw()
            }
            break
          case '搜索':
            type.select = !type.select
            unselectAll(3)
            this.isShowSetting = false
            this.isShowSettingSearch = type.select
            this.searchKeyword = ''
            break
        }
      }
      if (index === 2) {
        unselectAll(1)
        // unselectAll(4)
        this.mapToolBoxData.measureDisable = true
        this.$refs.selectionDraw.finish()
        this.$refs.iconDraw.finish()
        switch (type.name) {
          case '箭头':
            if (type.select) {
              type.select = false
              this.graph.type = 'None'
            } else {
              unselectAll(index)
              type.select = true
              //普通箭头
              this.graph.type = 'Arrow'
            }
            break
          case '矩形':
            if (type.select) {
              type.select = false
              this.graph.type = 'None'
            } else {
              unselectAll(index)
              type.select = true
              this.graph.type = 'Rectangle'
            }
            break
          case '圆形':
            if (type.select) {
              type.select = false
              this.graph.type = 'None'
            } else {
              unselectAll(index)
              type.select = true
              this.graph.type = 'Circle'
            }
            break
          case '划线':
            if (type.select) {
              type.select = false
              this.graph.type = 'None'
            } else {
              unselectAll(index)
              type.select = true
              this.graph.type = 'LineString'
            }
            break
          case '文本':
            if (type.select) {
              type.select = false
              this.graph.type = 'None'
            } else {
              unselectAll(index)
              type.select = true
              this.graph.type = 'Text'
            }
            break
          case '清屏画图':
            this.$refs.graph.clear()
            break
          case '橡皮':
            this.$refs.graph.redraw()
            break
        }
      }
      // if (index === 3) {
      //   if (!type.select) unselectAll(index)
      //   type.select = !type.select
      //   this.toolData[1].data[this.toolData[1].data.length - 1].select = false
      //   this.isShowSettingSearch = false
      //   this.isShowSetting = type.select
      // }
      if (index === 3) {
        unselectAll(1)
        unselectAll(2)
        this.mapToolBoxData.measureDisable = true
        this.$refs.selectionDraw.finish()
        this.graph.type = 'None'

        switch (type.name) {
          case '清屏图标':
            this.$refs.iconDraw.clear()
            break
          case '被困人员':
            if (type.select) {
              type.select = false
              this.$refs.iconDraw.finish()
            } else {
              unselectAll(index)
              type.select = true
              this.$refs.iconDraw.finish()
              this.mapToolBoxData.iconBrush.icon.src = new URL('@/assets/image/map/tool/bkry.png', import.meta.url).href
              this.$refs.iconDraw.draw()
            }
            break
          case '爆炸物':
            if (type.select) {
              type.select = false
              this.$refs.iconDraw.finish()
            } else {
              unselectAll(index)
              type.select = true
              this.$refs.iconDraw.finish()
              this.mapToolBoxData.iconBrush.icon.src = new URL('@/assets/image/map/tool/bzw.png', import.meta.url).href
              this.$refs.iconDraw.draw()
            }
            break
        }
      }
    },
    // 设置关闭
    closeSetting() {
      this.isShowSetting = false
      this.isShowSettingSearch = false
      this.searchKeyword = ''
      for (let toolDatum of this.toolData[3].data) {
        toolDatum.select = false
      }
      this.toolData[1].data[this.toolData[1].data.length - 1].select = false
    },
    // 选中结束事件
    selectionDrawEnd(e) {
      this.$emit('selectionDrawEnd', e)
    },
    // 绘制图标完成回调事件，进行设置图标样式
    iconDrawEnd(e) {
      e.feature.setStyle(parseStyle(this.mapToolBoxData.iconBrush))
    },
    // 图形绘制结束
    graphDrawEnd(e) {
      if (this.graph.type === 'Text') {
        const feature = e.feature
        const olText = feature?.getStyle()?.getText()
        if (olText) {
          this.$prompt('', '请输入标注文本', {
            inputValue: olText.getText() || '',
            inputPattern: /\S/,
            inputErrorMessage: '不能为空'
          })
            .then(({ value }) => {
              olText.setText(value)
              feature.changed()
            })
            .catch((err) => console.log(err))
        }
      }
    },
    // 导出地图截屏
    exportMap() {
      const map = this.map
      if (!map) return
      map.once('rendercomplete', () => {
        let mapCanvas = document.getElementsByClassName('ol-layer')[0].children[0]
        mapCanvas.toBlob(function (blob) {
          let fileName = 'map-' + new Date().getTime() + '.png'
          Utils.download(blob, fileName, 'blob')
        })
      })
      // 立即触发一次 rendercomplete 事件
      map.renderSync()
    },
  }
}
</script>

<style>
.el-input--small .el-input__inner {
  padding-left: 39px;
  padding-right: 39px;
}
</style>

<style lang="scss" scoped>
.state {
  position: absolute;
  display: inline-block;
  right: 9px;
  top: -6px;
  width: 20px;
  height: 20px;
  background-image: url('@/assets/image/map/tool/state.png');
  background-repeat: no-repeat;
  background-size: contain;
}

.mapToolBox {
  font-size: 14px;
  position: absolute;
  top: 10%;
  left: 10%;
  display: flex;
  z-index: 100;

  ::-webkit-scrollbar {
    width: 4px;
    height: 8px;
    background-color: #ebeef5;
  }

  ::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 6px rgba(16, 192, 255, 0.3);
    -webkit-box-shadow: inset 0 0 6px rgba(16, 192, 255, 0.2);
    background-color: #10c0ff;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(44, 70, 93, 0.8);
  }

  .mapToolBoxIn {
    display: flex;
    margin-right: 10px;
    box-shadow: 0 0 20px 10px #12316d inset;
    width: 51px;
    height: 51px;
    border: 1px solid #064b96;
    border-radius: 4px;
    background: #0b2438;
    color: #10c0ff;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: right ease 0.5s;
    font-size: 14px;
    cursor: pointer;

    i {
      margin-bottom: 2px;
    }
  }

  .fade-enter-active {
    animation: fadeInLeft 0.5s;
  }

  .fade-leave-active {
    animation: fadeOutLeft 0.5s;
  }

  .tool_open_box {
    position: absolute;
    top: 60px;
    left: 0;
    height: 50vh;
    overflow-y: auto;
    width: 250px;
    border: 1px solid #2668e8;
    box-shadow: 0 0 20px 10px #12316d inset;
    background-color: #112266;
    padding: 10px;
    color: #fff;

    p {
      margin: 0 0 10px 0;
    }

    ul {
      display: grid;
      grid-template-columns: 33.3% 33.3% 33.3%;
      margin: 0 0 10px 0;
      padding: 0;

      li {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        position: relative;
        left: 0;
        top: 0;
        margin-bottom: 10px;

        &:hover {
          color: #00ddaa;
        }
      }
    }
  }

  .tool_open_setting {
    position: absolute;
    top: 60px;
    left: 260px;
    overflow-y: auto;
    width: 250px;
    border: 1px solid #2668e8;
    box-shadow: 0 0 20px 10px #12316d inset;
    background-color: #112266;
    padding: 10px;
    color: #fff;

    .close {
      color: #65caff;
      position: absolute;
      top: 5px;
      right: 14px;
      cursor: pointer;
    }

    .items {
      margin-top: 20px;

      &.wrap {
        display: flex;
        flex-wrap: wrap;

        .item {
          flex: 0 0 50%;
        }
      }

      .item {
        display: flex;
        align-items: center;
        margin: 10px 0;

        .label {
          margin: 0 10px;
        }

        .content {
          margin: 8px;
        }

        &.side {
          .el-input-number {
            width: 60px;

            :deep(.el-input__inner) {
              padding-left: 5px;
              padding-right: 5px;
            }
          }

          justify-content: space-between;

          :deep(.el-checkbox__label) {
            color: #aaa;
          }

          .is-checked {
            :deep(.el-checkbox__label) {
              color: #fff;
            }
          }
        }
      }
    }
  }

  .poi-list {
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding-left: 8px;
      margin: 10px 0;
      cursor: pointer;
      // background-color: "rgba(89, 180, 185, 1)";

      &:hover {
        color: #00ddaa;
      }

      &.highlight {
        color: #00ddaa;
      }
    }
  }
}
</style>
