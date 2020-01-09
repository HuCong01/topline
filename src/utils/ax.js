// 独立文件，用于储存axios
import Vue from 'vue'

import axios from 'axios'
import router from '../router'
axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/'
Vue.prototype.$http = axios
// 在所有请求之前执行的代码
axios.interceptors.request.use(function (config) {
  // 处理请求前代码
  let userinfo = window.sessionStorage.getItem('userinfo')
  if (userinfo) {
    let token = JSON.parse(userinfo).token
    // 注意 token前边有Bearer 的信息前缀  前缀是带有空格的
    config.headers.Authorization = 'Bearer ' + token
  }

  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// 当服务器返回数据时执行的代码
axios.interceptors.response.use(function (response) {
  // 请求成功时，拦截的代码
  return response
}, function (error) {
  // 请求失败时，拦截的代码
  if (error.response.status === 401) {
    // token在服务端失效了，2个小时时效
    // 强制用户重新登录系统，以刷新服务端的token时效
    router.push('/login')
    // 不要给错误提示了
    return new Promise(function () {})// 空的Promise对象，没有机会执行catch,进而不做错误提示了
  }
  return Promise.reject(error)
})
