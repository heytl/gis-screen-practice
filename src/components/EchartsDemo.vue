<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import * as echarts from 'echarts'

const echartsRef = ref()

const options = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ],
      // 指定容器的高度和宽度
      grid: {
        width: '100%',
        height: '100%'
      }
    }
  ]
}

nextTick(() => {
  // Echarts 绑定 DOM
  const myChart = echarts.init(echartsRef.value)
  // 表配置
  myChart && myChart.setOption(options)

  window.addEventListener('resize', () => {
    myChart.resize()
  })
})
</script>

<template>
  <div class="echarts-demo" ref="echartsRef"></div>
</template>

<style lang="scss" scoped>
.echarts-demo {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
