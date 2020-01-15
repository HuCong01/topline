<template>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发表文章</span>
      </div>
        <el-form ref="editFormRef" :model="editForm" label-width="120px" :rules="editFormRules">
          <el-form-item label="标题：" prop="title">
            <el-input v-model="editForm.title"></el-input>
          </el-form-item>
          <el-form-item label="内容：" prop="content">
            <quill-editor v-model="editForm.content"></quill-editor>
          </el-form-item>
          <el-form-item label="封面 ">
            <el-radio-group v-model="editForm.cover.type">
              <el-radio :label="1">单图</el-radio>
              <el-radio :label="3">三图</el-radio>
              <el-radio :label="0">无图</el-radio>
              <el-radio :label="-1">自动</el-radio>
            </el-radio-group>
           <ul>
          <!-- 把item序号信息当做参数传递给showDialog,可以获得到的信息分别为 1 2 3 -->
          <li class="uploadbox" v-for="item in covernum" :key="item" @click="showDialog(item)">
            <span>点击图标选择图片</span>
            <img v-if="editForm.cover.images[item-1]" :src="editForm.cover.images[item-1]" alt="">
            <div v-else class="el-icon-picture-outline"></div>
          </li>
        </ul>

          </el-form-item>
          <el-form-item label="频道：" prop="channel_id">
            <channel @slt="selectHandler"></channel>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="editarticle(false)">发布</el-button>
            <el-button @click="editarticle(true)">存入草稿</el-button>
          </el-form-item>
        </el-form>
         <!-- @close是对话框的关闭事件，任何条件关闭对话框，都会执行该事件 -->
    <el-dialog title="提示" :visible.sync="dialogVisible" width="60%" @close="clearImage">
      <!-- 标签切换效果 -->
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="素材库" name="first">
          <!-- 素材图片列表展示 -->
          <ul>
            <li class="image-box" v-for="item in imageList" :key="item.id">
              <img :src="item.url" alt="没有图片" @click="clkImage" />
            </li>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="上传图片" name="second">
          <el-button type="primary">上传图片</el-button>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="imageOK">确 定</el-button>
      </span>
    </el-dialog>

        <!-- <el-dialog
      title="提示"
      :visible.sync="dialogVisible"  // 设定对话框是否显示
      width="30%" // 对话框宽度限制
      :before-close="handleClose" // 关闭前的回调处理
      >
      <span>这是一段信息</span> // 对话框主体内容(匿名插槽体现)
      <span slot="footer" class="dialog-footer"> // (命名插槽)
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
        </el-dialog>-->
    </el-card>
</template>

<script>
// 对频道“独立组件”做 导入、注册、使用
import Channel from '@/components/channel.vue'

// 导入富文本编辑器的css样式文件
// vue-quill-editor 是构建在quill基础之上的(是进一步的封装)
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入富文本编辑器的组件模块
import { quillEditor } from 'vue-quill-editor'
export default {
  name: 'Articleedit',
  created () {
    this.getArticleById()
    this.getImageList()
  },
  components: {
    quillEditor,
    Channel
  },
  computed: {
    aid () {
      return this.$route.params.aid
    },
    covernum () {
      // 设计选择框显示个数
      // type>0  ========= type值
      // type<=0 ==========0 值
      if (this.editForm.cover.type > 0) {
        return this.editForm.cover.type
      }
      return 0
    }
  },
  data () {
    return {
      materialUrl: '', // 记录选中的素材图片url地址的(临时接收)
      xu: 0, // 记录选择框序号 0第一个   1第二个   2第三个
      activeName: 'first', // 默认激活标签
      // 获得素材图片的条件
      querycdt: {
        collect: false, // 非收藏的
        page: 1, // 页码
        per_page: 12 // 条数
      },
      imageList: [], // 图片列表

      dialogVisible: false, // 对话框是否显示 true/false
      // 添加文章表单数据对象
      editForm: {
        title: '', // 文章标题
        content: '', // 文章内容
        // 文章封面
        cover: {
          type: 0, // 封面类型 -1:自动，0-无图，1-1张，3-3张
          images: [] // 封面图片 路径名集合
        },
        channel_id: '' // 频道
      },
      // 表单校验规则
      editFormRules: {
        title: [
          { required: true, message: '标题必填' },
          // 后端要求title长度介于5-30个字符
          {
            min: 5,
            max: 30,
            message: '标题长度介于5-30个字符'
          }
        ],
        content: [{ required: true, message: '内容必填' }],
        channel_id: [{ required: true, message: '频道必选' }]
      }
    }
  },

  methods: {
    clearImage () {
      // 清除border选中的高亮效果
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      // 清除选中图片的materialUrl地址
      this.materialUrl = ''
    },
    // 素材图片选好，点击对话框的确定  记录素材图片
    imageOK () {
      if (this.materialUrl) {
        // 给添加文章的表单域成员cover.image增加素材图片请求地址信息
        this.editForm.cover.images[this.xu] = this.materialUrl
        this.dialogVisible = false // 关闭对话框
      } else {
        this.$message.error('没有选取图片')
      }
    },
    clkImage (evt) {
      // 全部项目的border都清除
      let lis = document.querySelectorAll('.image-box')
      for (var i = 0; i < lis.length; i++) {
        lis[i].style.border = ''
      }
      let nowli = evt.target.parentNode
      nowli.style.border = '5px solid red'
      // 把当前选中图片的src地址信息赋予给meterialUrl成员
      this.materialUrl = evt.target.src
    },
    getImageList () {
      let pro = this.$http({
        url: '/mp/v1_0/user/images',
        method: 'get',
        params: this.querycdt
      })
      pro
        .then(result => {
          this.imageList = result.data.data.results
        })
        .catch(err => {
          return this.$message.error('获取素材失败' + err)
        })
    },
    // 展示对话框逻辑
    // n：代表第n个选择框被单击到了(值为1/2/3)
    showDialog (n) {
      // 更新xu成员,0/1/2分别代表选择框序号
      this.xu = n - 1
      this.dialogVisible = true
    },
    selectHandler (val) {
      this.editForm.channel_id = val
    },
    editarticle (flag) {
      // 表单整体校验
      this.$refs.editFormRef.validate(valid => {
        // 校验失败停止后续执行
        if (!valid) {
          return false
        }
        // 继续
        // axios
        let pro = this.$http({
          url: '/mp/v1_0/articles',
          method: 'post',
          data: this.editForm, // 表单数据
          params: { draft: flag } // 请求字符串数据
        })
        pro
          .then(result => {
            this.$message.success('发布文章成功')
            this.$router.push({ name: 'article' })
          })
          .catch(err => {
            return this.$message.error('发布文章失败' + err)
          })
      })
    },
    // 获得被修改文章的信息
    getArticleById () {
      // axios带着id请求服务器端
      let pro = this.$http({
        url: '/mp/v1_0/articles/' + this.aid,
        method: 'get'
      })
      pro
        .then(result => {
          // console.log(result)
          // editForm表单对象接收修改文章信息
          this.editForm = result.data.data
        })
        .catch(err => {
          return this.$message.error('获取文章失败：' + err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.quill-editor /deep/ .ql-editor {
  height: 200px;
}
// 文章封面选择框样式
.uploadbox {
  list-style: none;
  width: 200px;
  height: 200px;
  margin: 10px;
  float: left;
  cursor: pointer;
  border: 1px solid #eee;
  span {
    width: 200px;
    height: 50px;
    line-height: 50px;
    display: block;
    text-align: center;
  }
  div {
    width: 200px;
    height: 150px;
    font-size: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  img {
    width: 200px;
    height: 150px;
  }
}
// 对话框素材图片列表相关css样式
.image-box {
  list-style: none;
  width: 200px;
  height: 140px;
  background-color: #fff;
  margin: 10px;
  float: left;
  border: 1px solid #eee;
  cursor: pointer;
  box-sizing: border-box;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
