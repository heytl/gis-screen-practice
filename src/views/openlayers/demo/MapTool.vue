<template>
  <div class="map-tool">
    <el-dropdown>
      <el-button type="primary">
        工具
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="tool in mapTools" :key="tool.id" @click="changeTool(tool)">{{ tool.label }} </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <MapMeasure ref="measureRef" :disabled="measureToolData.disable" :type="measureToolData.type" show-node-tip />
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import MapMeasure from '@/components/CommonMap/MapMeasure/map-measure.vue'

type toolType = { id: string; label: string; active: boolean }
const activeTool = ref<toolType>()

const mapTools = ref([
  {
    id: 'ranging',
    label: '测距',
    active: false
  },
  {
    id: 'region',
    label: '测面',
    active: false
  },
  {
    id: 'markTool',
    label: '标记',
    active: false
  },
  {
    id: 'reset',
    label: '复位',
    active: false
  },
  {
    id: 'screenshot',
    label: '截图',
    active: false
  },
  {
    id: 'switchMap',
    label: '切换底图',
    active: false
  }
])
// 测量工具参数
const measureToolData = ref({
  disable: true,
  type: 'area'
})

function changeTool(tool) {
  if (tool && activeTool.value && tool.id === activeTool.value.id) {
    activeTool.value.active = !activeTool.value.active
    updateTool(activeTool.value)
  } else {
    if (activeTool.value && activeTool.value.active) {
      activeTool.value.active = false
      updateTool(activeTool.value)
    }
    tool.active = !tool.active
    activeTool.value = tool
    updateTool(activeTool.value)
  }
  // emits('changeTool', tool)
}

function updateTool(tool) {
  switch (tool.id) {
    case 'ranging':
      if (tool.active) {
        measureToolData.value.type = 'line'
      }
      measureToolData.value.disable = !tool.active
      break
    case 'region':
      if (tool.active) {
        measureToolData.value.type = 'area'
      }
      measureToolData.value.disable = !tool.active
      break
    default:
      tool.active = false
      break
  }
}
</script>
<style lang="scss" scoped>
.map-tool {
  z-index: 12;
  position: absolute;
  top: 0.5rem;
  left: 27%;
}
</style>
