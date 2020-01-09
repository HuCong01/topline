<template>
  <div class="block">
    <span class="demonstration">火影忍者百秀</span>
    <el-carousel height="600px">
      <el-carousel-item v-for="item in imgList" :key="item.id">
        <img :src="item.src" alt="" width="100%" height="100%">
      </el-carousel-item>
    </el-carousel>
  </div>
  </template>
<script>
export default {
  data () {
    return {
      imgList: [
        { id: 1, src: require('./1.jpg') },
        { id: 2, src: require('./2.jpg') },
        { id: 3, src: require('./3.jpg') },
        { id: 4, src: require('./4.jpg') },
        { id: 5, src: require('./5.jpg') }
      ]
    }
  }
}
</script>
<style>

</style>
