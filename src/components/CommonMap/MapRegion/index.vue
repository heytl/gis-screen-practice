<template>
  <el-dialog
    class="dialog-deatil"
    destroy-on-close
    width="40%"
    :title="props.title"
    :model-value="props.dialogVisible"
    :close-on-click-modal="false"
    @close="handleDialogClose"
    @open="handleDialogOpen"
  >
    <el-form-item label="选择方式：">
      <el-radio-group v-model="type" @change="handleTypeChange">
        <el-radio value="Polygon">按范围选择</el-radio>
        <el-radio value="Point">按点选择</el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="map-container">
      <CommonMap ref="mapRef">
        <map-draw ref="draw" :type="type" :effect="effect" @drawend="drawEnd" manual @drawstart="drawStart"></map-draw>
      </CommonMap>
    </div>
    <template #footer>
      <el-button plain @click="handleDialogClose">取消</el-button>
      <el-button plain @click="startDraw" v-if="mode === 'edit' && showButtons">重新绘制</el-button>
      <el-button type="primary" @click="handleSave" v-if="showButtons">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Feature from 'ol/Feature'
import { Point, Polygon } from 'ol/geom'
import CommonMap from '@/components/CommonMap/index.vue'
import MapDraw from '@/components/CommonMap/MapDraw/map-draw.vue'

const props = defineProps({
  title: {
    type: String,
    default: '选择区域',
  },
  dialogVisible: {
    type: Boolean,
    required: true,
  },
  // 图形坐标；一维数组是点；三维数组是面
  coordinates: {
    type: Array,
    default: () => [],
  },
  showButtons: {
    type: Boolean,
    default: true,
  },
})
const emits = defineEmits(['close', 'save'])
const coordinate = ref([])
const mode = ref('add')
const type = ref('Polygon')
// 绘制样式
const effect = {
  fill: 'rgba(90,200,33,0.5)',
  stroke: {
    color: 'rgba(90,200,33)',
    width: 2,
  },
  circle: {
    radius: 6,
    fill: 'rgba(90,200,33,1)',
    stroke: {
      width: 1,
      color: '#fff',
    },
  },
}
const mapRef = ref()
const draw = ref()

// 绘制结束，记录点位数据
function drawEnd(e) {
  draw.value.finish()
  let drawFeature = e.feature
  coordinate.value = drawFeature.getGeometry().getCoordinates()
  mode.value = 'edit'
}
// 重新绘制前清空图层要素
function drawStart() {
  draw.value.clear()
}
function startDraw() {
  coordinate.value = []
  draw.value.clear()
  draw.value.draw()
}

function showGeom() {
  const array = coordinate.value
  if (!array || array.length === 0) return
  let geometry
  if (Array.isArray(array[0])) {
    // 二维数组 面要素
    geometry = new Polygon(array)
  } else {
    // 点要素
    geometry = new Point(array)
  }

  // 创建初始要素
  let feature = new Feature({
    geometry: geometry,
  })

  if (feature) {
    draw.value.layer.getSource().addFeature(feature) // 绘制要素
    // 定义要缩放到的经纬度区域
    setTimeout(() => {
      mapRef.value.viewFit(draw.value.layer?.getSource()?.getExtent())
    }, 100)
  }
}

const handleDialogClose = () => {
  emits('close')
}

const handleDialogOpen = () => {
  coordinate.value = props.coordinates && props.coordinates.length ? props.coordinates : []
  if (coordinate.value.length) {
    mode.value = 'edit'
    showGeom()
  } else {
    mode.value = 'add'
    draw.value.draw()
  }
}

const handleSave = () => {
  if (coordinate.value.length !== 0) {
    emits('save', coordinate.value)
    emits('close')
  } else {
    ElMessage.warning('请先选择一个坐标点')
  }
}

const handleTypeChange = (type) => {
  console.log('type', type)
}

// 缩放至点位
const viewAnimate = (center) => {
  if (!center) {
    ElMessage.error('此水库坐标点位是无效值')
    return
  }
  setTimeout(() => {
    mapRef.value.animateView({
      center: center,
      zoom: 16,
      duration: 0,
    })
  }, 100)
}

defineExpose({
  viewAnimate,
})
</script>

<style lang="scss" scoped>
.form-wrap {
  margin-right: 30px;
}
.map-container {
  width: 100%;
  height: 400px;
}
</style>
