import Vue from 'vue'
import Router from 'vue-router'

// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ './components/Welcome.vue')

// import Users from './components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users-Rights-Role" */ './components/user/Users.vue')
// import Rights from './components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "Users-Rights-Role" */ './components/power/Rights.vue')
// import Roles from './components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "Users-Rights-Role" */ './components/power/Roles.vue')

// import Cate from './components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate-Params" */ './components/goods/Cate.vue')
// import Params from './components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate-Params" */ './components/goods/Params.vue')

// import List from './components/goods/List.vue'
const List = () => import(/* webpackChunkName: "List-Add" */ './components/goods/List.vue')
// import Add from './components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List-Add" */ './components/goods/Add.vue')

// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order-Report" */ './components/order/Order.vue')
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order-Report" */ './components/report/Report.vue')

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ] }
  ]
})

// 路由导航守卫，只有用户登录才能访问首页
router.beforeEach((to, from, next) => {
  // 访问登录页，直接放行
  if (to.path === '/login') return next()
  // 获取token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 未登录
  if (!tokenStr) return next('/login')
  // 已经登录
  next()
})

export default router
