<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cate">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            v-model="selectedCateKeys"
            @change="handleChange"
            :props="cateProps"
            :change-on-select="true"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 参数的值 -->
                <el-tag
                  v-for="(item,index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagClosed(index,slotProps.row)"
                >{{item}}</el-tag>
                <!-- 添加tag输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <!-- 添加tag按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <!-- 参数的值 -->
                <el-tag
                  v-for="(item,index) in slotProps.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleTagClosed(index,slotProps.row)"
                >{{item}}</el-tag>
                <!-- 添加tag输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slotProps.row.inputVisible"
                  v-model="slotProps.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                ></el-input>
                <!-- 添加tag按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slotProps.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(slotProps.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="deleteParams(slotProps.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有的商品分类数据列表（一二三级）
      cateList: [],
      // 选中的分类id值
      selectedCateKeys: [],
      // 级联选择器的配置
      cateProps: {
        // 指定选项的值为数据源对象的某个属性
        value: 'cat_id',
        // 指定选项标签为数据源对象的某个属性
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children'
      },
      // 选中标签页的name属性，默认选中第一个
      activeName: 'many',
      // 动态参数列表
      manyList: [],
      // 静态属性列表
      onlyList: [],
      // 控制添加参数对话框是否可见
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改参数对话框是否可见
      editDialogVisible: false,
      // 修改参数表单数据对象
      editForm: {},
      // 修改参数表单校验规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制添加tag输入框是否可见
      inputVisible: false,
      // 添加tag输入框的值
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      this.cateList = res.data
    },
    // 获取参数列表数据
    async getParamsList() {
      // 控制级联选择器只能选中三级分类
      if (this.selectedCateKeys.length !== 3) {
        // 重置级联选择器
        this.selectedCateKeys = []
        // 清除动态参数列表和静态属性列表
        this.manyList = []
        this.onlyList = []
        return
      }
      // 获取参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('获取参数列表失败')
      }
      // 将参数的值转换成数组
      res.data.forEach(element => {
        // 以空格分隔将值转换成数组(值不为空才转)
        element.attr_vals = element.attr_vals
          ? element.attr_vals.split(' ')
          : []
        // 添加属性，控制添加tag输入框的显示和绑定输入的值
        element.inputVisible = false
        element.inputValue = ''
      })
      console.log(res.data)
      // 将返回的数据保存在不同的变量
      if (this.activeName === 'many') {
        this.manyList = res.data
      } else {
        this.onlyList = res.data
      }
    },
    // 级联选择器选中项发生改变时触发
    handleChange() {
      // 获取参数列表数据
      this.getParamsList()
    },
    // tabs标签页点击事件处理函数
    handleTabClick() {
      // 获取参数列表数据
      this.getParamsList()
    },
    // 添加参数对话框关闭会触发
    addDialogClosed() {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数（操作数据库）
    addParams() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        // 重新获取参数列表数据
        this.getParamsList()
        // 关闭对话框
        this.addDialogVisible = false
        // 成功提示
        this.$message.success('添加参数成功')
      })
    },
    // 显示修改参数对话框
    async showEditDialog(attrId) {
      // 根据 ID 查询参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 保存数据
      this.editForm = res.data
      // 显示
      this.editDialogVisible = true
    },
    // 监听修改参数对话框关闭
    editDialogClosed() {
      // 重置表单
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数（操作数据库）
    editParams() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        // 重新获取参数列表
        this.getParamsList()
        // 关闭对话框
        this.editDialogVisible = false
        // 提示成功
        return this.$message.success('修改参数成功')
      })
    },
    // 删除参数（操作数据库）
    async deleteParams(attrId) {
      const deleteResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (deleteResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      // 重新获取参数列表
      this.getParamsList()
      return this.$message.success('删除参数成功')
    },
    // 监听添加tag输入框的enter键keyup事件和失去焦点事件
    async handleInputConfirm(row) {
      // trim函数去掉字符串两端的空格
      if (row.inputValue.trim().length === 0) {
        // 清空输入框
        row.inputValue = ''
        // 隐藏输入框
        row.inputVisible = false
        return
      }
      // 将输入框的内容保存在数组中
      row.attr_vals.push(row.inputValue.trim())
      // 清空输入框
      row.inputValue = ''
      // 隐藏输入框
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 编辑提交参数的值
    async saveAttrVals(row) {
      // 提交数据到数据库
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          // 数据库存储的是空格分隔的字符串
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('编辑提交参数的值失败')
      }
      // 成功提示
      this.$message.success('编辑提交参数的值成功')
    },
    // 显示添加tag输入框
    showInput(row) {
      row.inputVisible = true
      // 显示tag输入框时自动聚焦
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // tag close事件处理函数
    handleTagClosed(index, row) {
      // 删除attr_vals数组对应的项
      row.attr_vals.splice(index, 1)
      // 将结果保存在数据库
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 控制添加参数和添加属性按钮是否可用
    isDisabled() {
      return !(this.selectedCateKeys.length === 3)
    },
    // 当前选中的三级分类id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 当前添加参数对话框的标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cate {
  margin: 15px auto;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
  margin: 5px;
}
</style>
