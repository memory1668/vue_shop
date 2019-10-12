<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加商品信息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tabs标签页 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                v-model="addForm.goods_cat"
                @change="handleChange"
                :props="cascaderProps"
                :change-on-select="true"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyList" :key="item.attr_id">
              <!-- 双向绑定的item.attr_vals用来记录多选框选中的label集合 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="upLoadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="add" class="addBtn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewDialogVisible" width="50%">
      <img :src="imgUrl" style="width:100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 	设置当前激活步骤
      // 选中选项卡的name
      activeIndex: '0',
      // 添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器选中的值
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单校验规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 商品分类级联选择器配置
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyList: [],
      // 静态属性列表
      onlyList: [],
      // 上传图片的后台URL地址
      upLoadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 在请求头中使用 Authorization 字段提供 token 令牌
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的url
      imgUrl: '',
      // 控制预览图片对话框是否可见
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选项发生改变
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        // 清空分类数组
        this.addForm.goods_cat = []
      }
    },
    // 切换选项卡前触发
    beforeLeave(activeName, oldActiveName) {
      // 当基本信息中的商品分类选项没有选择选项，禁止切换到别的选项卡
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab 被选中时触发
    async tabClicked() {
      // 商品参数tab被选中
      if (this.activeIndex === '1') {
        // 获取动态参数列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // 将attr_vals的值转换成数组
        res.data.forEach(element => {
          element.attr_vals = element.attr_vals
            ? element.attr_vals.split(' ')
            : []
        })
        this.manyList = res.data
        console.log(this.manyList)
      } else if (this.activeIndex === '2') {
        // 获取静态属性列表
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        }
        this.onlyList = res.data
        console.log(this.onlyList)
      }
    },
    // 预览图片
    handlePreview(file) {
      // 获得图片的完整url
      this.imgUrl = file.response.data.url
      // 显示图片预览对话框
      this.previewDialogVisible = true
    },
    // 图片上传成功的处理函数
    handleSuccess(response) {
      // 将图片的临时位置保存在添加商品的表单对象
      const pic = { pic: response.data.tmp_path }
      this.addForm.pics.push(pic)
    },
    //图片删除
    handleRemove(file) {
      // 获取上传图片的临时路径
      const tmpPath = file.response.data.tmp_path
      // 根据临时路径查找所在数组的索引
      const index = this.addForm.pics.findIndex(item => item.pic === tmpPath)
      // 删除该索引的数组项
      this.addForm.pics.splice(index, 1)
    },
    // 添加商品（操作数据库）
    add() {
      // 表单预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 对添加表单对象的一些属性进行处理
        // 深拷贝addForm对象
        const postForm = _.cloneDeep(this.addForm)
        // 将goods_cat属性转换成api需要的逗号连接的字符串
        postForm.goods_cat = postForm.goods_cat.join(',')
        // 往商品参数数组添加数据
        // 添加动态参数
        this.manyList.forEach(item => {
          const paramObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(paramObj)
        })
        // 添加静态属性
        this.onlyList.forEach(item => {
          const paramObj = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(paramObj)
        })
        postForm.attrs = this.addForm.attrs
        // 发起添加商品请求
        const { data: res } = await this.$http.post('goods', postForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功')
        // 跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 级联选择器当前选中的三级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
// 复选框
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
// 添加商品按钮
.addBtn {
  margin-top: 15px;
}
</style>
