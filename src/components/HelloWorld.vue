<script setup lang="ts">
import { useRouter } from 'vue-router'
defineProps<{ msg: string }>()
const router = useRouter()

const clickBtn = (path = '/gis') => {
  router.push(path)
}

</script>

<template>
  <div class="card">
    <el-button @click="clickBtn('/gis')">GIS 大屏</el-button>
    <el-button @click="clickBtn('/amap')">Amap 地图</el-button>
    <el-button @click="clickBtn('/demo')">Demo</el-button>
  </div>
</template>

<style lang="scss" scoped>
.card {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .el-button {
    height: 100px;
    width: auto;
    font-size: 40px;
    border-radius: 20px;
  }
}
</style>
