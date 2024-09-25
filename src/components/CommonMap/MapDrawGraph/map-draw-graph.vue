<template>

</template>

<script>
  import LayerVector from 'ol/layer/Vector'
  import SourceVector from 'ol/source/Vector'
  import Draw, {createBox, createRegularPolygon} from 'ol/interaction/Draw'
  import {Point, Polygon} from "ol/geom";
  import {Circle, Fill, Icon, Stroke, Style, Text} from "ol/style";
  import GeoJSON from 'ol/format/GeoJSON'
  import parseStyle from '@/components/CommonMap/MapDraw/style'

  // 默认图形样式
  const defaultEffect = {
    // 填充
    fill: 'rgba(255, 255, 255, 0.5)',
    // 边界
    stroke: {
      color: '#409eff',
      width: 2
    },
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
    name: "map-draw-graph",
    inject: ['map'],// 获取地图组件的viewModel
    emits: ['drawend'],
    props: {
      shape: {
        type: String,
        default: 'Circle',
        validator(val) {
          return ['Arrow', 'Circle', 'LineString', 'Square', 'Rectangle', 'Hexagram', 'None', 'Text'].includes(val)
        }
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
          return defaultText;
        }
      }
    },
    data() {
      return {
        source: new SourceVector({
          wrapX: false // 禁止横向无限重复（底图渲染的时候会横向无限重复）
        })
      }
    },
    watch: {
      shape(newVal) {
        this.addInteraction()
      }
    },
    mounted() {
      this.layer = new LayerVector({
        source: this.source,
        zIndex: 100,
      });

      this.$nextTick(() => {
        const map = this.map
        map.addLayer(this.layer)
        this.addInteraction()
      })
    },
    methods: {
      addInteraction() {
        const map = this.map

        if (this.draw !== null) {
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
              let center = coordinates[0];
              //鼠标点击的另一个点
              let last = coordinates[1];
              let dx = center[0] - last[0];
              let dy = center[1] - last[1];
              //半径
              let radius = Math.sqrt(dx * dx + dy * dy);
              //旋转的角度
              let rotation = Math.atan2(dy, dx);
              //用来记录顶点坐标的数组
              let newCoordinates = [];
              //顶点个数
              let numPoints = 12;
              for (let i = 0; i < numPoints; ++i) {
                //顶点相对转过的角度
                let angle = rotation + i * 2 * Math.PI / numPoints;
                //确定凸顶点和凹顶点
                let fraction = i % 2 === 0 ? 1 : 0.58;
                //计算顶点的坐标
                let offsetX = radius * fraction * Math.cos(angle);
                let offsetY = radius * fraction * Math.sin(angle);
                newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
              }
              newCoordinates.push(newCoordinates[0].slice());
              if (!geometry) {
                geometry = new Polygon([newCoordinates]);
              } else {
                geometry.setCoordinates([newCoordinates]);
              }
              return geometry;
            }
          } else if (this.shape === 'LineString' || this.shape === 'Arrow') {
            type = 'LineString'
          } else if (this.shape === 'Text') {
            type = 'Point'
          }

          this.draw = new Draw({
            source: this.source,
            type,
            geometryFunction
          })

          this.draw.on('drawend', (event) => {
            const styleJSON = this.shape === 'Text' ? this.textEffect : this.graphEffect
            this.getStyle(event.feature) && event.feature.setStyle(this.getStyle(event.feature))

            this.$emit('drawend', event)
          })

          map.addInteraction(this.draw)
        }
      },
      // 获取当前样式
      getStyle(feature) {
        let style;
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
      /**
       * 获取当前画布图层上的图形
       * @method getFeatures
       * @returns {Array}
       */
      getFeatures() {
        if (!this.layer) return []
        const source = this.layer.getSource()
        return source.getFeatures()
      },
      /**
       * 删除指定图形
       * @method removeFeature
       * @param feature
       */
      removeFeature(feature) {
        const source = this.layer.getSource()
        source.removeFeature(feature)
      },
      /**
       * 添加图形, 图形加入到矢量图层
       * @method addFeature
       * @param {Feature[]|feature} feature
       */
      addFeature(feature) {
        const features = [].concat(feature)
        const source = this.layer.getSource()
        source.addFeatures(features)
      },
      /**
       * 图层上全部图形转换成JSON描述
       * @returns {string}
       */
      toJSON() {
        const features = this.getFeatures()
        return new GeoJSON().writeFeatures(features)
      },
      /**
       * 根据GeoJSON在图层上创建 feature
       * @param {object} json
       */
      fromJSON(json) {
        const features = new GeoJSON().readFeatures(json)
        this.addFeature(features)
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
        let geometry = feature.getGeometry()
        let styles = []
        let lineStyle = parseStyle(this.graphEffect)
        styles.push(lineStyle)

        const strokeColor = lineStyle.getStroke().getColor()
        const strokeWidth = lineStyle.getStroke().getWidth()
        geometry.forEachSegment((start, end) => {
          let dx = end[0] - start[0]
          let dy = end[1] - start[1]
          let rotation = Math.atan2(dy, dx)
          styles.push(new Style({
            geometry: new Point(end),
            image: new Icon({
              color: strokeColor, // 箭头颜色与线段保持一致
              // src: require('@/assets/image/map/arrow.png'),
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='240' height='240'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E",// 图标
              scale: strokeWidth * 12 / 240, // 计算箭头比例，保持和线宽度同步变化
              anchor: [0.6, 0.5],
              rotateWithView: true,
              rotation: -rotation
            })
          }))
        })
        return styles
      },
      textStyleFunction(feature) {
        let style = new Style({
          image: new Circle({
            radius: 3,
            stroke: new Stroke({
              color: '#fff',
            }),
            fill: new Fill({
              color: '#F00',
            })
          }),
          text: new Text({
            fill: new Fill({
              color: "rgba(0,0,0,1)"
            }),
            stroke: new Stroke({
              color: "rgba(255,255,255,1)",
              width: 3
            })
          })
        })
        style.getText().setText(feature.get('name'));
        return this.createRoundStyle(feature.get('name'))
      }
      ,
      /**
       * 创建圆角标注
       * 原理：根据文本长度绘制圆角 canvas 背景，作为
       * @param text
       * return Style
       */
      createRoundStyle: function (text) {
        let fontStyle = '14px Microsoft YaHei'; // 文字字体
        let canvas, context;

        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
        context.font = fontStyle || '12px' // 设置字体样式，当然，也可以在这里给一个默认值
        let dimension = context.measureText(text).width;// 计算文本宽度
        canvas.width = dimension + 13;
        canvas.height = 22;
        let x = 0, y = 0, w = canvas.width, h = canvas.height, r = 4;
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        context.beginPath();
        context.moveTo(x + r, y);
        context.arcTo(x + w, y, x + w, y + h, r);
        context.arcTo(x + w, y + h, x, y + h, r);
        context.arcTo(x, y + h, x, y, r);
        context.arcTo(x, y, x + w, y, r);
        context.closePath();
        context.fillStyle = "#FFF";
        context.fill();

        return new Style({
          image: new Icon({
            img: canvas,
            imgSize: [w, h],
            anchorOrigin: 'bottom-left',// 原点位置
            anchorXUnits: 'pixels',// anchor单位为 'pixels'
            anchorYUnits: 'pixels',// anchor单位为 'pixels'
            anchor: [w / 2, h / 2],// x,y的锚点偏移值[x,y]
          }),
          text: new Text({
            // offsetX: 16,
            offsetY: 1,
            text: text, // 文本内容
            textAlign: "center", // 对齐方式（标注文字相对于符号）
            textBaseline: "middle", // 文本基线
            font: fontStyle,
            fill: new Fill({color: "#000"})
          })
        });
      }
    }
  }
</script>

<style scoped>

</style>