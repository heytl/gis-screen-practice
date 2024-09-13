<!--（新版）通用高德 POI 查询功能-->
<!--直接调用高德 api 请求查询-->
<!--高德API资料：https://lbs.amap.com/api/webservice/guide/api/search-->
<template>
  <div></div>
</template>

<script>
import axios from 'axios'
// import transformUtil from './transform'

export default {
  name: 'AMapPOISearch',
  // inject: ['mapVm'], // 地图组件的viewModel
  emits: ['poiChange'],
  props: {
    // 搜索方式 text表示关键词搜索，around表示周边搜索
    type: {
      type: String,
      default: 'text',
      validator(val) {
        return ['text', 'around'].includes(val)
      },
    },
    // 高德Web服务密钥 key，必填参数
    amapKey: {
      type: String,
      default: '1992fdac2f82de0180b5013b0e5e5655',
    },
    // 查询关键字，必填参数（不能为''）
    keywords: {
      type: String,
      default: ' ',
    },
    // 查询城市，可选参数
    city: {
      type: String,
      default: '成都',
    },
    // 当前页数
    page: {
      type: Number,
      default: 1,
    },
    // 每页记录数据
    offset: {
      type: Number,
      default: 12,
    },
    // 查询中心，周边搜索有效 （传入坐标需WGS84，自动转换为gcj02）
    location: {
      type: Array,
      default: () => [104.733931, 31.489089],
    },
    // 查询半径，周边搜索有效
    radius: {
      type: Number,
      default: 5000,
    },
  },
  computed: {
    params() {
      const { type, amapKey, keywords, city, page, offset, location, radius } = this
      return { type, amapKey, keywords, city, page, offset, location, radius }
    },
  },
  watch: {
    params: {
      handler() {
        if (this.type === 'text') this.search()
        if (this.type === 'around') this.aroundSearch()
      },
      deep: true,
    },
    pois: {
      handler(value) {
        this.$emit('poiChange', value)
      },
      deep: true,
    },
  },
  data() {
    return {
      // 高德API
      textSearchUrl: 'https://restapi.amap.com/v3/place/text',
      aroundSearchUrl: 'https://restapi.amap.com/v3/place/around',
      pois: [], // POI 数组
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 关键词搜索
    search() {
      const { amapKey, keywords, city, page, offset } = this
      // key 和 keywords必填
      if (!amapKey || !keywords) return (this.pois = [])
      const _params = { key: amapKey, keywords, city, page, offset }
      axios
        .get(this.textSearchUrl, {
          params: _params,
        })
        .then((res) => {
          const { count, pois, status, info } = res.data
          if (status === '1' && info === 'OK') {
            // console.log("POI 请求数据成功！", pois)
            this.pois = this.handleData(pois)
          } else {
            console.error('POI 请求数据失败: ', info)
            this.pois = []
          }
        })
    },
    // 周边 + 关键词搜索
    aroundSearch() {
      const { amapKey, keywords, city, page, offset, location, radius } = this
      // key 和 location 必填
      if (!amapKey || !location || !keywords) return (this.pois = [])
      const _params = {
        key: amapKey,
        keywords,
        city,
        page,
        offset,
        location: this.wgs2gcj(location).toString(),
        radius,
      }
      axios
        .get(this.aroundSearchUrl, {
          params: _params,
        })
        .then((res) => {
          const { count, pois, status, info } = res.data
          if (status === '1' && info === 'OK') {
            this.pois = this.handleData(pois)
          } else {
            console.error('POI 请求数据失败: ', info)
            this.pois = []
          }
        })
    },
    // WGS84 转 gcj02
    wgs2gcj(coordinate) {
      try {
        return coordinate
        // const gcjLonLat = transformUtil.wgs2gcj(coordinate[1], coordinate[0])
        // return [gcjLonLat.lng, gcjLonLat.lat]
      } catch (error) {
        return []
      }
    },
    // 数据处理
    handleData(pois) {
      if (pois && pois.length > 0) {
        pois.forEach((poi) => {
          const { id, location, name, address } = poi
          const gcjCoordinate = location.split(',').map(Number)
          // 坐标转换 gcj02 => wgs84
          // const wgsLonLat = transformUtil.gcj2wgs(gcjCoordinate[1], gcjCoordinate[0])
          const wgsLonLat = gcjCoordinate
          const coordinate = [wgsLonLat.lng, wgsLonLat.lat]
          // 存放wgs84坐标
          poi.coordinate_ = coordinate
        })
      }
      return pois
    },
  },
}
</script>

<style lang="scss" scoped></style>
