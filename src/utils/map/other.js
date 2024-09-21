// 添加鼠标中键拖动旋转地图
export function addMouseCenterDragRotate(map) {
  // 禁用默认的旋转控制
  // map.removeInteraction(map.getInteractions().getArray().find(interaction => interaction instanceof DragRotate));
  let lastAngle_
  // 添加自定义的中键拖动旋转事件处理程序
  map.on('pointerdrag', (evt) => {
    if (evt.originalEvent.buttons === 4) {
      // console.log('map-pointerdrag', evt.originalEvent);
      const map = evt.map
      const view = map.getView()
      const size = map.getSize()
      // 当前鼠标的像素坐标
      const offset = evt.pixel
      // 计算鼠标相对于地图中心的角度
      const theta = Math.atan2(size[1] / 2 - offset[1], offset[0] - size[0] / 2)
      if (lastAngle_ !== undefined) {
        // 计算上次的鼠标角度与当前鼠标的角度差
        const delta = theta - lastAngle_
        // 调整视图的旋转角度
        view.adjustRotationInternal(-delta)
      }
      // 保存当前鼠标的角度
      lastAngle_ = theta
    }
  })

  map.on('pointerdown', (evt) => {
    if (evt.originalEvent.buttons === 4) {
      lastAngle_ = undefined
    }
  })
}
