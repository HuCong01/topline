<template>
    <div class="login-container">
      <div class="login-box">
          <!-- 绘制登录form表单 -->
           <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
          <img src="./index.png" alt="">
          <el-form-item prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="请输入手机号码"></el-input>
          </el-form-item>
          <el-form-item prop="code">
            <el-input v-model="loginForm.code" placeholder="请输入验证码"></el-input>
          </el-form-item>
          <el-form-item style="text-align:left;" prop="xieyi">
            <el-checkbox v-model="loginForm.xieyi" style="margin-right:10px;"></el-checkbox>
            <span>我已阅读并同意 <a href="#">用户协议</a> 和 <a href="#">隐私条款</a> </span>
          </el-form-item>
          <el-form-item>
            <el-button style="width:100%;" type="primary" @click="login()">登录</el-button>
          </el-form-item>
          </el-form>
      </div>
    </div>
</template>

<script>
import './gt.js'
export default {

  name: '',
  data () {
    // 自定义校验函数，验证协议
    var xieyiTest = function (rule, value, callback) {
      // rule:校验规则，一般不用
      // value:当前被校验的信息
      // callback：回调函数，校验成功或失败都需要执行
      // if (value) {
      //   callback()
      // } else {
      //   return callback(new Error('请无条件遵守规矩'))
      // }

      value ? callback() : callback(new Error('请无条件遵守规矩'))
    }
    return {
      loginForm: {
        mobile: '', // 手机号码
        code: '', // 校验码
        xieyi: false // 协议
      },
      loginFormRules: {
        mobile: [
          { required: true, message: '手机号码必填' },
          { pattern: /^1[35789]\d{9}$/, message: '手机号码格式不对' }
        ],
        code: [
          { required: true, message: '验证码必填' }
        ],
        xieyi: [
          { validator: xieyiTest }
        ]
      }
    }
  },
  methods: {

    // 登录系统
    login () {
      // 全部表单域项目校验
      // 获得form表单组件的语句: this.$refs.loginFormRef
      // form组件.validate(回调函数)
      // 参数valid：会体现布尔值，表示校验是否成功
      this.$refs.loginFormRef.validate(valid => {
        if (!valid) { return false }
        // A.人机交互验证
        // axios获得极验的密匙信息
        let pro = this.$http({
          url: '/mp/v1_0/captchas/' + this.loginForm.mobile,
          method: 'get'
        })
        pro
          .then(result => {
            // console.log(result)//获取极验秘钥信息
            // 从result里边解构下述的data对象出来
            let{ data } = result.data
            // 请检测data的数据结构，保证data.gt,data.challenge,data.success有值
            window.initGeetest({
            // 以下配置来自服务端 SDK
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: 'bind' // 设置验证窗口样式的
            }, captchaObj => {
              // 这里可以调用验证实例 captchaObj 的实例方法
              captchaObj.onReady(() => {
                captchaObj.verify()// 显示验证码窗口
              }).onSuccess(() => {
                this.loginAct()
              }).onError(() => {

              })
            })
          })
          .catch(err => {
            return this.$message.error('获取极验密匙失败:' + err)
          })
      })
      // this.$router.push('/home')
      // this.$router.push({ name: 'home' })
    },
    loginAct () {
      let pro = this.$http({
        url: '/mp/v1_0/authorizations',
        method: 'post',
        data: this.loginForm
      })
      pro
        .then(result => {
          // console.log(result) // 【data】  status statusText headers config request
          // 客户端浏览器把服务器端返回的秘钥等相关信息通过 sessionStorage 做记录，表明是登录状态
          window.sessionStorage.setItem('userinfo', JSON.stringify(result.data.data))
          this.$router.push({ name: 'home' })
        })
        .catch(err => {
          // 通过弹出框把错误显示出来
          // console.log('手机号码或验证码错误:' + err)
          // this.$message({
          //   type: 'error',
          //   message: '手机号码或验证码错误:' + err,
          // 设置停留时间
          // duration:1000
          // })
          // 上下效果一致
          this.$message.error('手机号或验证码错误:' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container{
  height:100%;
  background-color: gray;
  background-image: url("./big.jpg");
  background-size: cover;
  display:flex;
  justify-content: center;
  align-items: center;
  .login-box{
    width:410px;
    height:345px;
    background-color: rgba(0, 255, 255, 0.5);
    display:flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  img{
      height: 70px;
      width: 50%;
      margin: 20px auto;
  }
    .el-form{
        width: 75%;
    }
  }
}
</style>
