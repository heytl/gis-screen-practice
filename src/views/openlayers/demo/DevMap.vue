<script setup lang="ts">
import CommonMap from '@/components/CommonMap/index.vue'
import MapPlot from '@/components/Ol/MapPlot.vue'
import MapTool from '@/views/openlayers/demo/components/MapTool.vue'
import MapToolBox from '@/views/openlayers/demo/components/map-toolbox.vue'
import MapToolBoxNew from '@/views/openlayers/demo/components/MapToolBox.vue'
import MapContextMenu from '@/views/openlayers/demo/components/map-contextmenu.vue'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { useHandleMap } from './hooks/useHandleMapHooks'
import { useMapSetting } from './hooks/useMapSettingHooks'
import MiddleClickDragRotate from '@/plugins/ol-mapkit/MiddleClickDragRotate.js'
import MapCurveLine from './components/MapCurveLine.vue'
const mapRef = shallowRef(null)
const toolBoxRef = ref(null)
const { mapPointerMove, mapClick } = useHandleMap()
onMounted(() => {
  addCustomInteraction()
})

const mapInstance = shallowRef(null)
const mapInited = ref(false)
function mapDefined(map) {
  mapInstance.value = map
  mapInited.value = true
  console.log('map', mapInstance.value);
  // const { addGraticule } = useMapSetting(map)
}

function addCustomInteraction() {
  const rotateInteraction = new MiddleClickDragRotate();
  mapRef.value.map.addInteraction(rotateInteraction);
}

function deleteFeature(feature) {
  feature && toolBoxRef.value.deleteFeature(feature)
}

function changeTool(tool) {
  switch (tool.id) {
    case 'switchMap':
      mapRef.value.toggleMap()
      break
    default:
      break;
  }
}
</script>

<template>
  <CommonMap ref="mapRef" @pointermove="mapPointerMove" @singleclick="mapClick" @mapDefined="mapDefined">
    <MapTool @changeTool="changeTool" />
    <MapToolBox ref="toolBoxRef" />
    <!-- <MapToolBoxNew /> -->
    <MapContextMenu @removeFeature="deleteFeature" />
    <MapPlot v-if="mapInited" :map="mapInstance" />
    <MapCurveLine />
  </CommonMap>
</template>

<style lang="scss" scoped></style>
