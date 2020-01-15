<template>
  <!--C. v-model直接绑定nowid-->
  <el-select v-model="nowid" placeholder="请选择" clearable>
    <el-option v-for="item in channelList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
export default {
  name: 'Channel',
  // B. 修改文章应用中，由于默认要显示一个频道，故要通过props接收父组件传递过来默认选中频道信息chid，
  // 并通过watch监听器进一步传递给nowid，默认频道就显示了
  props: {
    // 接收父组件传递过来的频道id
    chid: {
      default: ''
    }
  },
  watch: {
    // A. 由于需要把选中的频道传递给父组件，故声明watch监听器以实现功能
    nowid (newV) {
      // 选中的频道传递给父组件
      this.$emit('slt', newV)
    },
    // 把父组件传递过来的频道id赋予给nowid，设置默认显示
    chid (newV) {
      this.nowid = newV
    }
  },

  data () {
    return {
      channelList: [], // 接收频道列表数据
      nowid: '' // 当前选中的频道id
    }
  },
  created () {
    this.getChannelList()
  },
  methods: {
    // 获取频道列表数据
    getChannelList () {
      var pro = this.$http.get('/mp/v1_0/channels')
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            this.channelList = result.data.data.channels
          }
        })
        .catch(err => {
          return this.$message.error('获得文章频道错误：' + err)
        })
    }
  }
}
</script>
