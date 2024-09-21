import { Pointer as PointerInteraction } from 'ol/interaction'
/**
 * 鼠标中键拖动旋转
 */
class MiddleClickDragRotate extends PointerInteraction {
  constructor(options) {
    super(options)

    this.lastAngle_ = undefined
  }

  handleDownEvent(event) {
    if (event.originalEvent.buttons === 4) {
      this.lastAngle_ = undefined
      return true
    }
    return false
  }

  handleDragEvent(event) {
    if (event.originalEvent.buttons === 4) {
      const map = event.map
      const view = map.getView()
      const size = map.getSize()
      // 当前鼠标的像素坐标
      const offset = event.pixel
      // 计算鼠标相对于地图中心的角度
      const theta = Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2)
      if (this.lastAngle_ !== undefined) {
        // 计算上次的鼠标角度与当前鼠标的角度差
        const delta = theta - this.lastAngle_
        // 调整视图的旋转角度
        view.adjustRotationInternal(-delta)
      }
      // 保存当前鼠标的角度
      this.lastAngle_ = theta
    }
  }

  handleUpEvent(event) {}
}

export default MiddleClickDragRotate
