<template>
  <el-dialog
    class="dialog-deatil"
    destroy-on-close
    width="40%"
    title="地图定位"
    :model-value="props.dialogVisible"
    :close-on-click-modal="false"
    @close="handleDialogClose"
    @open="handleDialogOpen"
  >
    <div class="map-container">
      <CommonMap ref="mapRef">
        <map-draw ref="draw" type="Point" :effect="effect" @drawend="drawEnd" manual @drawstart="drawStart"></map-draw>
        <MapHtml :position="selPoi?.coordinate_" positioning="bottom-center" :offset="[0, -45]">
          <div class="poi_pop">
            {{ selPoi?.name }}
          </div>
        </MapHtml>
        <MapHtml :position="selPoi?.coordinate_" positioning="bottom-center">
          <img :src="placeBlueIcon" />
        </MapHtml>
      </CommonMap>
      <AMapPOISearch
        ref="poiSearch"
        city="德阳"
        type="text"
        :keywords="searchKeyword"
        @poiChange="poiChange"
      ></AMapPOISearch>
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索位置"
          style="width: 200px"
          :clearable="true"
          :prefix-icon="Search"
        ></el-input>
        <div v-if="pois && pois.length > 0" class="poi-list">
          <div class="item" v-for="poi in pois" :key="poi.id" @click="selectPoi(poi)">
            {{ poi.name }}
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="warning" @click="drawPoint" v-if="mode === 'edit' && showButtons">重 绘</el-button>
      <el-button type="primary" @click="handleSave" v-if="showButtons">保存当前坐标</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import CommonMap from '@/components/CommonMap/index.vue'
import MapDraw from '@/components/CommonMap/MapDraw/map-draw.vue'
import { Search } from '@element-plus/icons-vue'
import AMapPOISearch from '@/components/CommonMap/MapSearch/AMapPOISearch.vue'
import MapHtml from '@/components/CommonMap/MapHtml/map-html.vue'
// import placeIcon from '@/assets/images/dashboard/map/place.png'
// import placeSelectIcon from '@/assets/images/dashboard/map/place-selected.png'
import placeBlueIcon from '@/assets/images/dashboard/map/place-blue.png'
import gcoord from 'gcoord'

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    required: true,
  },
  lon: {
    type: Number,
    default: 0,
  },
  lat: {
    type: Number,
    default: 0,
  },
  showButtons: {
    type: Boolean,
    default: true,
  },
})
const searchKeyword = ref('')
const pois = ref([])
const selPoi = ref(null)
const emits = defineEmits(['close', 'save'])
const coordinate = ref([])
const mode = ref('add')
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
  const coordinates = e.feature.getGeometry().getCoordinates()
  coordinate.value = coordinates.map((item) => item.toFixed(7)).map(Number)
}
// 重新绘制前清空图层要素
function drawStart() {
  draw.value.clear()
}
function drawPoint() {
  draw.value.draw()
}

function isValidCoordinates(lng, lat) {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90
}

function addDrowPoint() {
  // console.log(draw.value.getFeatures(), '12321312')
  const array = coordinate.value
  if (isValidCoordinates(array[0], array[1])) mapRef.value.map.getView().setCenter(array)

  // 创建初始点要素
  let feature = new Feature({
    geometry: new Point(array),
  })
  if (feature) {
    draw.value.layer.getSource().addFeature(feature) // 绘制图层新增初始点
  }
}

const handleDialogClose = () => {
  emits('close')
}

const handleDialogOpen = () => {
  searchKeyword.value = ''
  coordinate.value = props.lon && props.lat ? [props.lon, props.lat] : []
  if (coordinate.value.length) {
    mode.value = 'edit'
    addDrowPoint()
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

const poiChange = (data) => {
  pois.value = data
  if (!data || data.length === 0) selPoi.value = null
}

const selectPoi = (poi) => {
  console.log('poi', poi)
  const location = poi.location
  const gcjCoordinate = location.split(',').map(Number)
  // 坐标转换 gcj02 => wgs84
  const wgsLonLat = gcoord.transform(gcjCoordinate, gcoord.GCJ02, gcoord.WGS84)
  // const wgsLonLat = gcj02towgs84(gcjCoordinate[1], gcjCoordinate[0])
  // 存放wgs84坐标
  poi.coordinate_ = wgsLonLat
  selPoi.value = poi
  mapRef.value.animateView({
    center: wgsLonLat,
    zoom: 16,
  })
}
</script>

<style lang="scss" scoped>
.form-wrap {
  margin-right: 30px;
}
.map-container {
  width: 100%;
  height: 400px;
  position: relative;

  .search-container {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;

    .poi-list {
      width: 100%;
      list-style: none;
      padding: 8px 0;
      margin-top: 8px;
      border-radius: 8px;
      background: rgba(17, 49, 64, 0.9);

      .item {
        padding-left: 8px;
        // margin: 10px 0;
        cursor: pointer;
        // background: #113140c9;

        &:hover {
          color: #00c8ff;
        }

        &.highlight {
          color: #00c8ff;
        }
      }
    }
  }
}

:deep(.el-input__wrapper) {
  background: #113140c9;
}

.poi_pop {
  padding: 8px;
  background-color: rgba(11, 36, 58, 1);
  font-size: 14px;
  font-family: Microsoft YaHei;
  font-weight: 400;
  border-radius: 2px;
  border: 1px solid rgba(6, 75, 150, 1);
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.5);
  color: #fff;
  &:after,
  &:before {
    top: 100%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  &:after {
    border-top-color: rgba(11, 36, 58, 1);
    border-width: 8px;
    margin-top: -1px;
  }

  &:before {
    border-top-color: rgba(6, 75, 150, 1);
    border-width: 8px;
  }
}
</style>
