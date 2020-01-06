import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // {path:'/login',component:箭头函数}
  // 如下是import()函数调用，好处是按需导入
  // @符号代表src目录的绝对路径名地址
  { path: '/login', name: 'login', component: () => import('@/views/login') },
  { path: '/home', name: 'home', component: () => import('@/views/home') }
]

const router = new VueRouter({
  routes
})
// 配置全局前置路由守卫
router.beforeEach((to, form, next) => {
  // 获取用户登录状态信息
  let userinfo = window.sessionStorage.getItem('userinfo')
  // 登录状态：userinfo是大字符串，非登录状态:userinfo是null
  if (!userinfo && to.path !== '/login') {
    // 强制登录
    return next('/login')
  }
  // 放行
  next()
})

export default router
