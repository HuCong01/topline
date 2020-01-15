<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>粉丝统计</span>
    </div>
    <div id="main" ref="main2" style="width: 600px;height:400px;"></div>
  </el-card>
</template>
<script>
import echarts from 'echarts'
export default {
  name: 'Fans',
  // paintPic需要尽早被调用(以便显示图表效果)，
  //   要在mounted中调用(此时页面容器已经编译好并渲染完成了)
  mounted () {
    // 绘制图表
    this.paintpic()
  },
  data () {
    return {
      myChart: null // 接收echarts图表对象
    }
  },
  methods: {
    // 绘制图表
    paintpic () {
    // 基于准备好的dom，初始化echarts实例
    // 在vue中获得页面元素有两种方式
      // 1. dom方式，例如document.getElementById('main')
      // 2. ref方式，this.$refs.xxx
      // el-form ref="loginForm" this.$refs.loginForm.validate()
      //    ref既可以获得组件对象
    //  还可以获得html标签对象(与document.getElementById()表达意思相同)
      // var myChart = echarts.init(document.getElementById('main'))
      // 基于准备好的dom，初始化echarts实例
      let dv = this.$refs.main2
      this.myChart = echarts.init(dv)
      // 指定图表的配置项和数据
      let option = {
        title: {
          text: '某站点用户访问来源',
          subtext: '纯属虚构',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      // 绘制图表
      this.myChart.setOption(option)
      this.getFansStat()
    },
    getkeys (obj) {
      var keys1 = []
      for (var p1 in obj) {
        if (obj.hasOwnProperty(p1)) { keys1.push(p1) }
      }
      return keys1
    },
    // 动态获得服务器真实粉丝数据
    getFansStat () {
      // axios发起请求(该接口不稳定，会提示404，多尝试即可)
      let pro = this.$http({
        url: '/mp/v1_0/statistics/followers',
        method: 'get'
      })
      pro
        .then(result => {
          // 把粉丝数据封装为option的样子
          // age:{le18:57,le23:71……}
          // 1. 把legend的data数据通过result组织
          let keys = this.getkeys(result.data.data.age)
          // console.log(keys) // ['le18','le23'……]
          // 2. 把series的data数据通过result组织
          let dataObj = []
          let ages = result.data.data.age
          for (var k in ages) {
            // 把 成员的key和value获得出来填充到dataObj里边
            dataObj.push({ value: ages[k], name: k })
          }
          // console.log(dataObj)
          let opt = {
            legend: {
              // data: ['le18', 'le23', 'le30', 'le40', 'le50']
              data: keys
            },
            series: [
              {
                data: dataObj
              }
            ]
          }
          // echarts图表对象调用setOption()
          this.myChart.setOption(opt)
        })
        .catch(err => {
          return this.$message.error('获得粉丝统计数据失败：' + err)
        })
    }
  }
}
</script>
