<script setup lang="ts">
import Map from 'ol/Map'
import { inject, reactive, onMounted, toRaw, onUnmounted } from 'vue'
import MapHtml from '@/components/CommonMap/MapHtml/map-html.vue'

const map = inject<Map>('map')
const contextMenuParams = reactive({
  show: false,
  position: [0, 0],
  feature: null
})
const emits = defineEmits(['removeFeature'])

onMounted(() => {
  init(toRaw(map))
})

onUnmounted(() => {
  dispose(toRaw(map))
})

function init(map) {
  if (!map) return
  map.on('contextmenu', onContextMenu);
  map.on('click', onMapClick)
}

function dispose(map) {
  map.un('contextmenu', onContextMenu);
  map.un('click', onMapClick)
}

// 地图右键菜单处理回调函数
function onContextMenu(evt) {
  evt.preventDefault()
  const feature = map.forEachFeatureAtPixel(evt.pixel, (ft) => ft);
  if (feature && feature.get('type') === 'removable') {
    var coordinate = evt.coordinate;
    contextMenuParams.show = true
    contextMenuParams.position = coordinate
    contextMenuParams.feature = feature
  } else {
    contextMenuParams.show = false
    contextMenuParams.feature = null
  }
}

function onMapClick() {
  contextMenuParams.show = false
}

// 菜单被点击
function handleClick() {
  contextMenuParams.show = false
  emits('removeFeature', contextMenuParams.feature)
}
</script>
<template>
  <div v-show=false>
    <MapHtml v-if="contextMenuParams.show" ref="contextMenuRef" :offset="[10, 10]" positioning="top-left"
      :position="contextMenuParams.position">
      <div class="context-menu">
        <div class="context-menu__item" @click="handleClick">删除</div>
      </div>
    </MapHtml>
  </div>
</template>
<style lang="scss" scoped>
.context-menu {
  width: 100px;
  padding: 8px 0;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);

  .context-menu__item {
    color: #333;
    padding: 5px 10px;
    cursor: pointer;

    &:hover {
      background: #d1d1d1;
    }
  }
}
</style>