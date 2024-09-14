/* 
    绘制矩形范围,截图保存到本地
 */
import VectorSource from 'ol/source/Vector'
import Draw, { createBox } from 'ol/interaction/Draw'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'

// 绘制矩形后,截图保存到本地
export function drawMap(map, imgName, callback) {
  const source = new VectorSource({
    wrapX: false
  })
  const draw = new Draw({
    source,
    type: 'Circle',
    style: new Style({
      stroke: new Stroke({
        color: '#4771f0',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0)'
      }),
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({
          color: '#4771f0'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 2
        })
      })
    }),
    geometryFunction: createBox()
  })
  map.addInteraction(draw)
  draw.on('drawend', (evt) => {
    // source.clear();
    map.removeInteraction(draw)
    console.log(evt)
    map.renderSync()

    const extent = evt.feature.getGeometry().getExtent()
    //地理坐标转换屏幕坐标
    const coord = [extent[0], extent[3]]
    const leftTopPosition = map.getPixelFromCoordinate(coord)
    const coord1 = [extent[2], extent[1]]
    const bottomRightPosition = map.getPixelFromCoordinate(coord1)
    //计算框选矩形的宽度以及高度像素
    const width = Math.abs(bottomRightPosition[0] - leftTopPosition[0])
    const height = Math.abs(bottomRightPosition[1] - leftTopPosition[1])
    //计算框选矩形的左上角屏幕坐标
    const minx = leftTopPosition[0]
    const miny = leftTopPosition[1]
    //创建canvas元素
    const mapCanvas = document.getElementsByClassName('ol-layer')[0].children[0]
    const imageData = mapCanvas.getContext('2d').getImageData(minx, miny, width, height)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').putImageData(imageData, 0, 0)
    const dataUrl = canvas.toDataURL() //转换图片为dataURL
    const link = document.createElement('a')
    link.download = imgName
    link.href = dataUrl
    link.click()
    callback('截图成功')
  })
}

export function mapScreenShot() {
  const source = new VectorSource({
    wrapX: false
  })
  let draw = null

  function rectangleScreenShot(map, imgName, callback) {
    draw = new Draw({
      source,
      type: 'Circle',
      style: new Style({
        stroke: new Stroke({
          color: '#4771f0',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)'
        }),
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: '#4771f0'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2
          })
        })
      }),
      geometryFunction: createBox()
    })
    map.addInteraction(draw)
    draw.on('drawend', (evt) => {
      // source.clear();
      map.removeInteraction(draw)
      console.log(evt)
      map.renderSync()

      const extent = evt.feature.getGeometry().getExtent()
      //地理坐标转换屏幕坐标
      const coord = [extent[0], extent[3]]
      const leftTopPosition = map.getPixelFromCoordinate(coord)
      const coord1 = [extent[2], extent[1]]
      const bottomRightPosition = map.getPixelFromCoordinate(coord1)
      //计算框选矩形的宽度以及高度像素
      const width = Math.abs(bottomRightPosition[0] - leftTopPosition[0])
      const height = Math.abs(bottomRightPosition[1] - leftTopPosition[1])
      //计算框选矩形的左上角屏幕坐标
      const minx = leftTopPosition[0]
      const miny = leftTopPosition[1]
      //创建canvas元素
      const mapCanvas = document.getElementsByClassName('ol-layer')[0].children[0]
      const imageData = mapCanvas.getContext('2d').getImageData(minx, miny, width, height)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').putImageData(imageData, 0, 0)
      const dataUrl = canvas.toDataURL() //转换图片为dataURL
      const link = document.createElement('a')
      link.download = imgName || 'mapShot'
      link.href = dataUrl
      link.click()
      callback && callback('截图成功')
    })
  }

  function stopScreenShot(map) {
    draw && map && map.removeInteraction(draw)
    draw = null
  }

  function fullScreenShot(map, imgName) {
    if (!map) return
    map.once('rendercomplete', () => {
      const mapCanvas = document.getElementsByClassName('ol-layer')[0].children[0]
      const dataUrl = mapCanvas.toDataURL() //转换图片为dataURL
      const link = document.createElement('a')
      link.download = imgName || 'mapShot'
      link.href = dataUrl
      link.click()
    })
    // 立即触发一次 rendercomplete 事件
    map.renderSync()
  }

  return {
    rectangleScreenShot,
    stopScreenShot,
    fullScreenShot
  }
}
