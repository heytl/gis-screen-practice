import { getTopLeft, getWidth } from 'ol/extent.js'
import TileLayer from 'ol/layer/Tile.js'
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
