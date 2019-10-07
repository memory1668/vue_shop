<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text="#"
        :expand-type="false"
        :selection-type="false"
        :show-row-hover="false"
        border
      >
        <!-- 是否有效列 -->
        <template v-slot:isEffective="slotScope">
          <i
            class="el-icon-success"
            v-if="slotScope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序列 -->
        <template v-slot:order="slotScope">
          <el-tag v-if="slotScope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="slotScope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template v-slot:operate="slotScope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedParentCate"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            expand-trigger="hover"
            :change-on-select="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      cateList: [],
      // 数据总数
      total: 0,
      // 获取商品分类数据列表的查询参数
      queryInfo: {
        // 获取三层分类数据
        type: 3,
        // 当前页码值,默认第1页
        pagenum: 1,
        // 每页显示多少条数据,默认显示5条
        pagesize: 5
      },
      // 表格的列配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 模板名称
          template: 'isEffective'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 模板名称
          template: 'operate'
        }
      ],
      // 控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        // 分类父id,默认是0,一级分类
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级,默认是0,添加一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请填写分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 级联选择器选中的父级分类id
      selectedParentCate: [],
      // 级联选择器的配置
      cascaderProps: {
        // 指定选项的值
        value: 'cat_id',
        // 指定选项标签
        label: 'cat_name',
        // 指定选项的子选项
        children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange(newSize) {
      // 修改查询参数
      this.queryInfo.pagesize = newSize
      // 重新获取商品分类数据
      this.getCateList()
    },
    // 监听pagenum变化
    handleCurrentChange(currentNum) {
      // 修改查询参数
      this.queryInfo.pagenum = currentNum
      // 重新获取商品分类数据
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog() {
      // 获取父级分类数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表(获取所有一二级分类)
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据列表失败')
      }
      this.parentCateList = res.data
    },
    // 级联选择器的父级分类选项发生变化
    parentCateChanged() {
      const length = this.selectedParentCate.length
      // 当级联选择器选中一个或两个选项
      if (length > 0) {
        // 更新分类父id
        this.addCateForm.cat_pid = this.selectedParentCate[length - 1]
        // 更新分类层级
        this.addCateForm.cat_level = length
      } else {
        // 当级联选择器没有选择分类选项
        // 重置分类父id
        this.addCateForm.cat_pid = 0
        //  重置分类层级
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类（操作数据库）
    addCateInfo() {
    //  预校验
    this.$refs.addCateFormRef.validate(async valid=>{
      if(!valid){
        return
      }
      const { data: res } = await this.$http.post('categories',this.addCateForm)
      if(res.meta.status !== 201){
        return this.$message.error('添加分类数据失败')
      }
      // 重新获取商品分类数据列表
      this.getCateList()
      // 关闭对话框
      this.addCateDialogVisible = false
      // 成功提示
       this.$message.success('添加分类成功')
    })
    },
    // 监听添加分类对话框关闭事件，重置表单
    addCateDialogClosed(){
      // 重置文本框
      this.$refs.addCateFormRef.resetFields()
      // 重置级联选择器
      this.selectedParentCate = []
      // 重置表单数据
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
// 树形表格
.zk-table {
  margin-top: 15px;
}
// 级联选择器
.el-cascader {
  width: 100%;
}
</style>
