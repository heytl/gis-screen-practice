import { getTopLeft, getWidth } from 'ol/extent.js'
import { Group as LayerGroup, Tile as TileLayer } from 'ol/layer'
import { get as getProjection } from 'ol/proj.js'
import WMTS from 'ol/source/WMTS.js'
import WMTSTileGrid from 'ol/tilegrid/WMTS.js'
import { BingMaps, XYZ } from 'ol/source'

// const projection4326 = getProjection('EPSG:4326')
// const projection3857 = getProjection('EPSG:3857')

const tdt_tk = 'dc80ba057070fd2f818bd57b8a672e12' // 天地图tk

/**
 * 天地图创建 （WMTS方式）
 * type 参照天地图 http://lbs.tianditu.gov.cn/server/MapService.html
 * @param type [vec_c:经纬度矢量底图, img_c:经纬度影像底图, cva_c: 经纬度投影矢量注记,	cia_c: 经纬度投影影像注记]
 * @returns {TileLayer<WMTS>}
 */
export function createTDTLayerWMTS(type = 'vec_c') {
  if (type.indexOf('_') === -1) return
  let url = 'https://t{0-7}.tianditu.gov.cn/' + type + '/wmts?tk=' + tdt_tk
  let projection
  let types = type.split('_')
  if (types[1] === 'c') {
    // 经纬度投影
    projection = getProjection('EPSG:4326')
  } else if (types[1] === 'w') {
    // 球面墨卡托投影
    projection = getProjection('EPSG:3857')
  } else {
    return
  }

  let projectionExtent = projection.getExtent()
  let size = getWidth(projectionExtent) / 256
  let resolutions = new Array(18)
  let matrixIds = new Array(18)
  for (let z = 1; z < 19; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z)
    matrixIds[z] = z
  }
  let layer = new TileLayer({
    source: new WMTS({
      crossOrigin: 'anonymous', // 跨域操作
      url: url,
      layer: types[0],
      matrixSet: types[1],
      format: 'tiles',
      style: 'default',
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds
      }),
      wrapX: true
    }),
    preload: Infinity
  })
  layer.id = type
  return layer
}

/**
 * 天地图创建 （XYZ方式）
 * type 参照天地图 http://lbs.tianditu.gov.cn/server/MapService.html
 * @param type
 * @returns {*|TileLayer<XYZ>}
 */
export function createTDTLayerXYZ(type) {
  if (type.indexOf('_') === -1) return
  let url = 'http://t{0-7}.tianditu.com/DataServer?T=' + type + '&x={x}&y={y}&l={z}&tk=' + tdt_tk
  let projection
  let types = type.split('_')
  if (types[1] === 'c') {
    // 经纬度投影
    projection = getProjection('EPSG:4326')
  } else if (types[1] === 'w') {
    // 球面墨卡托投影
    projection = getProjection('EPSG:3857')
  } else {
    return
  }

  let layer = new TileLayer({
    source: new XYZ({
      crossOrigin: '', // 跨域操作
      url: url,
      projection: projection
    })
  })
  layer.id = type
  return layer
}

/***
 * 必应影像地图
 * @returns {*|TileLayer<BingMaps>}
 */
export function createBingLayer() {
  return new TileLayer({
    source: new BingMaps({
      crossOrigin: '', // 跨域操作
      key: 'AiotD4tAe47BWAde1EMW_KjA2T1ukjITgJlOhlvwQg0B6j00IkLJKkkPkAq4I5j_',
      imagerySet: 'Aerial'
    })
  })
}


/***
 * 高德矢量地图
 * @returns {*|TileLayer<XYZ>}
 */
export function createGaodeVecLayer() {
  return new TileLayer({
    source: new XYZ({
      crossOrigin: '', // 跨域操作
      url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
    }),
  })
}

/**
 * 创建高德地图图层
 * @param {string} layerType - 地图类型，可选值: 'normal' (矢量), 'satellite' (卫星), 'satellite_road' (卫星带路网)
 * @returns {TileLayer} - OpenLayers 地图图层对象
 */
export function createGaodeLayer(layerType) {
  let url

  switch (layerType) {
    case 'normal': // 矢量地图
      url =
        'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
      break
    case 'satellite': // 卫星图
      url =
        'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
      break
    case 'satellite_road': // 卫星图带路网
      // 卫星图和路网是两个独立的图层，需要叠加
      // 这里返回一个图层组，包含两个子图层
      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
          crossOrigin: 'anonymous',
          maxZoom: 18,
        }),
      })

      const roadLayer = new TileLayer({
        source: new XYZ({
          // ltype=2 纯路网，ltype=7 带注记的路网，不带ltype默认详细注记路网
          url: 'https://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
          crossOrigin: 'anonymous',
          maxZoom: 18,
        }),
      })

      // 创建一个图层组，并把两个图层放进去
      return new LayerGroup({
        layers: [satelliteLayer, roadLayer],
      })

    default:
      console.error('不支持的高德地图类型：' + layerType)
      return null
  }

  // 如果是单个图层，则统一返回
  if (url) {
    return new TileLayer({
      source: new XYZ({
        url: url,
        crossOrigin: 'anonymous', // 解决跨域问题
      }),
    })
  }
}
