import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入字体图标
import './assets/fonts/iconfont.css'
// 引入全局样式
import './assets/css/global.css'
// 导入axios
import axios from 'axios'
// 导入树形表格
import TreeTable from 'vue-table-with-tree-grid'
// 导入NProgress包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.component('tree-table', TreeTable)

// 请求拦截器
axios.interceptors.request.use(config => {
  // 在请求头中使用 Authorization 字段提供 token 令牌,以请求需要授权的 API
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 显示进度条
  NProgress.start()
  // 必须return config
  return config
})
// 响应拦截器
axios.interceptors.response.use(config => {
  // 隐藏进度条
  NProgress.done()
  return config
})
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 时间格式的过滤器
Vue.filter('dateFormat', function(val) {
  const date = new Date(val)
  // 年
  const y = date.getFullYear()
  // 月
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const d = (date.getDate() + '').padStart(2, '0')

  // 时
  const H = (date.getHours() + '').padStart(2, '0')
  // 分
  const M = (date.getMinutes() + '').padStart(2, '0')
  // 秒
  const S = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${H}:${M}:${S}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
