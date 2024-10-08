import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const app = createApp(App)
// 全局引入ElementPlus
app.use(ElementPlus, {
  locale: zhCn
}) 
// 配置常驻路由
app.use(router)
app.mount('#app')
