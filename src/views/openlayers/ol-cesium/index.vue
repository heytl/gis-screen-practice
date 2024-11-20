<script setup lang="ts">
import CommonMap from '@/components/CommonMap/index.vue'
import MapTool from '@/views/openlayers/demo/components/MapTool.vue'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import * as Cesium from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css";
// @ts-ignore
window.Cesium = Cesium
import 'ol-cesium/dist/olcs.css'
import OLCesium from 'ol-cesium'
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZDQ2MjZlOS0yYjZmLTQ5YzYtOTM5OS1lMjdkN2FhMGE4ODciLCJpZCI6MTI3NDI5LCJpYXQiOjE3MzE0ODAxMjd9.SMcrvTAYf3_2JL_wK8cuTXZK0nuzDJVnSaDYO2TKRKE';
const mapRef = shallowRef(null)
// debugger
function changeTool(tool) {
  switch (tool.id) {
    case 'switchMap':
      map3d?.setEnabled(!map3d.getEnabled())
      break
    default:
      break;
  }
}
let map3d

onMounted(() => {
  console.log('ditu', mapRef.value.map);
  const map = mapRef.value.map
  map3d = new OLCesium({ map: map });
})
</script>

<template>
  <CommonMap ref="mapRef">
    <MapTool @changeTool="changeTool" />
  </CommonMap>
</template>

<style lang="scss" scoped></style>