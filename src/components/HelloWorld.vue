<script setup lang="ts">
import { useRouter } from 'vue-router'
defineProps<{ msg: string }>()
const router = useRouter()

const clickBtn = () => {
  router.push('/gis')
}
</script>

<template>
  <div class="card">
    <el-button @click="clickBtn">GIS 大屏</el-button>
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
    width: 200px;
    font-size: 40px;
    border-radius: 30px;
  }
}
</style>
