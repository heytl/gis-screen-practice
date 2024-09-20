<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { Map } from 'ol'
import 'ol-plot/dist/ol-plot.css'
import Plot from 'ol-plot'
import { onMounted } from 'vue'
const props = defineProps({
  map: Map
})
let plot: Plot

onMounted(() => {
  console.log('map-loaded', props.map)
  const map = props.map
  /* eslint-disable-next-line */
  plot = new Plot(map, {
    zoomToExtent: true
  })

  // activate('DoubleArrow')
})

// 指定标绘类型，开始绘制。
function activate(type: String) {
  plot?.plotEdit.deactivate()
  plot?.plotDraw.activate(type)
}
</script>

<template>
  <div class="map-plot">
    <el-dropdown>
      <el-button type="primary">
        标绘
        <el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="activate('DoubleArrow')">双箭头</el-dropdown-item>
          <el-dropdown-item @click="activate(Plot.PlotTypes.STRAIGHT_ARROW)">细直箭头</el-dropdown-item>
          <el-dropdown-item @click="activate(Plot.PlotTypes.ASSAULT_DIRECTION)">粗单直箭头</el-dropdown-item>
          <el-dropdown-item @click="activate(Plot.PlotTypes.ATTACK_ARROW)">进攻方向</el-dropdown-item>
          <el-dropdown-item @click="activate(Plot.PlotTypes.GATHERING_PLACE)">集结地</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style scoped>
.map-plot {
  position: absolute;
  top: 2%;
  left: 2%;
  z-index: 999;
}
</style>
