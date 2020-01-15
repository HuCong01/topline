<template>
  <div>
    <!-- //搜索卡片区 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>全部图文</span>
      </div>
      <!-- 匿名插槽，内容主体 -->
      <div class="text item">
        <!-- el-form 搜索表单区域 -->
        <el-form ref="searchFormRef" :model="searchForm" label-width="100px">
          <el-form-item label="文章状态:">
            <el-radio-group v-model="searchForm.status">
              <el-radio label>全部</el-radio>
              <el-radio :label="0">草稿</el-radio>
              <el-radio :label="1">待审核</el-radio>
              <el-radio :label="2">审核通过</el-radio>
              <el-radio :label="3">审核失败</el-radio>
              <el-radio :label="4">已删除</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="频道列表:">
           <channel @slt="selectHandler"></channel>
          </el-form-item>
          <el-form-item label="时间选择:">
            <el-date-picker
              v-model="timetotime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>共找到{{tot}}条符合条件的内容</span>
      </div>
      <div class="text item">
        <el-table :data="articleList" style="width:100%;">
          <el-table-column label="图标" prop="cover.images[0]" width="300">
            <img
              slot-scope="stData"
              :src="stData.row.cover.images[0]"
              alt="没有图标"
              width="150"
              height="100"
            />
          </el-table-column>
          <el-table-column label="标题" prop="title"></el-table-column>
          <el-table-column label="状态" prop="status">
            <template slot-scope="stData">
              <el-tag v-if="stData.row.status===0">草稿</el-tag>
              <el-tag type="info" v-else-if="stData.row.status===1">待审核</el-tag>
              <el-tag type="success" v-else-if="stData.row.status===2">审核通过</el-tag>
              <el-tag type="warning" v-else-if="stData.row.status===3">审核失败</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" prop="pubdate"></el-table-column>
          <el-table-column label="操作">
         <template slot-scope="stData">
  <el-button type="primary" size="mini"
             @click="$router.push(`/articleedit/${stData.row.id}`)">修改</el-button>
  <el-button type="danger" size="mini" @click="del(stData.row.id)">删除</el-button>
</template>
          </el-table-column>
        </el-table>
        <!-- 分页效果 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.page"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="searchForm.per_page"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tot"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import Channel from '@/components/channel.vue'
export default {
  name: 'ArticleList',
  components: {
    // 注册频道独立组件
    Channel
  },
  data () {
    return {
      searchForm: {
        status: '',
        channel_id: '', // 频道id
        begin_pubdate: '', // 文章发布开始时间
        end_pubdate: '', // 文章发布结束时间
        // 增加分页相关成员
        page: 1, // 默认获取第1页数据
        per_page: 10 // 每页返回10条记录
      },
      timetotime: [],
      channelList: [],
      articleList: [], // 文章列表
      tot: 0
    }
  },
  watch: {
    searchForm: {
      handler: function (newV, oldV) {
        this.getArticleList()
      },
      deep: true
    },
    timetotime: function (newV) {
      if (newV) {
        this.searchForm.begin_pubdate = newV[0]
        this.searchForm.end_pubdate = newV[1]
      } else {
        this.searchForm.begin_pubdate = ''
        this.searchForm.end_pubdate = ''
      }
    }
  },
  methods: {
    selectHandler (val) {
      this.searchForm.channel_id = val
    },
    // 删除文章
    del (id) {
      this.$confirm('确认要删除该数据么?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // axios请求服务器端实现删除
          let pro = this.$http({
            url: '/mp/v1_0/articles/' + id,
            method: 'delete'
          })
          pro
            .then(result => {
            // 删除成功
              this.$message.success('删除文章成功')
              // console.log(result)  // 返回空的data数据
              // 直接页面刷新即可
              this.getArticleList()
            })
            .catch(err => {
              return this.$message.error('删除文章失败：' + err)
            })
        })
        .catch(() => {})
    },
    handleSizeChange (val) {
      // val:变化后的每页条数
      this.searchForm.per_page = val // 根据变化后的每页条数重新获得文章列表
      this.getArticleList()
    },
    handleCurrentChange (val) {
      // val：变化后的页码
      this.searchForm.page = val
      // 根据变化后的页码重新获取文章列表
      this.getArticleList()
    },
    // 获得真实数据列表
    getChannelList () {
      let pro = this.$http({
        url: '/mp/v1_0/channels',
        method: 'get'
      })
      pro
        .then(result => {
          this.channelList = result.data.data.channels
        })
        .catch(err => {
          return this.$message.error('获得频道失败:' + err)
        })
    },
    // 获得文章列表信息
    getArticleList () {
      // 把searchForm内部为空的成员都过滤掉
      let searchData = {}
      for (var i in this.searchForm) {
        // i:代表对象的成员属性名称, status、channel_id、begin_pudate等等
        if (this.searchForm[i] || this.searchForm[i] === 0) {
          // 成员值非空
          searchData[i] = this.searchForm[i]
        }
      }
      let pro = this.$http.get('/mp/v1_0/articles', { params: searchData })
      pro
        .then(result => {
          if (result.data.message === 'OK') {
            // 把文章赋予给articleList成员
            this.articleList = result.data.data.results
            this.tot = result.data.data.total_count // 总记录条数
          }
        })
        .catch(err => {
          return this.$message.error('获得文章列表错误:' + err)
        })
    }
  },
  created () {
    this.getChannelList()
    this.getArticleList()
  }
}
</script>

<style lang="less" scoped>
.box-card {
  background-color: rgba(255, 255, 255, 0.3);
  margin-bottom: 15px;
}
</style>
