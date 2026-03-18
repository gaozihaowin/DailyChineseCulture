import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import NavBar from './components/NavBar/index.vue'

export function createApp() {
  const app = createSSRApp(App)
  // 全局注册 NavBar 组件
  app.component('NavBar', NavBar)
  return {
    app
  }
}
// #endif