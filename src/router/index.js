import Vue from 'vue'
import VueRouter from 'vue-router'
// 引入nprogress相关的js和css文件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
Vue.use(VueRouter)

const routes = [
  // {path:'/login',component:箭头函数}
  // 如下是import()函数调用，好处是按需导入
  // @符号代表src目录的绝对路径名地址
  { path: '/login', name: 'login', component: () => import('@/views/login') },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home'),
    // 路由重定向
    redirect: '/welcome',
    children: [
      // 欢迎页面子路由配置
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') },
      { path: '/huoyin', name: 'huoyin', component: () => import('@/views/huoyin') },
      { path: '/articleadd', name: 'articleadd', component: () => import('@/views/articleadd') },
      { path: '/articleedit/:aid', name: 'articleedit', component: () => import('@/views/articleedit') },
      { path: '/account', name: 'account', component: () => import('@/views/account') },
      { path: '/material', name: 'material', component: () => import('@/views/material') },
      { path: '/fans', name: 'fans', component: () => import('@/views/fans/index.vue') }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 配置全局前置路由守卫
router.beforeEach((to, form, next) => {
  // 开启进度条
  NProgress.inc()
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
router.afterEach((to, form) => {
  // 完成进度条显示了
  NProgress.done()
})

export default router
