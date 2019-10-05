<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="slotProps">
            <el-row
              :class="['bdbottom','vcenter',index1 === 0? 'bdtop':'']"
              v-for="(item1,index1) in slotProps.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRightById(slotProps.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  :class="['vcenter',index2 === 0?'':'bdtop']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(slotProps.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(slotProps.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(slotProps.row.id)"
            >编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRole(slotProps.row)">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(slotProps.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="rightTreeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRightsForRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="addRoleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form :model="addRoleForm" ref="editRoleFormRef" :rules="editRoleRules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      setRightVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      defKeys: [],
      roleId: 0,
      // 添加角色对话框是否可见
      addRoleDialogVisible: false,
      // 添加角色表单信息
      addRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色表单校验规则
      addRoleRules:{
        roleName:[
           { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      // 编辑角色对话框是否可见
      editRoleDialogVisible:false,
      // 编辑角色表单校验规则
      editRoleRules:{
        roleName:[
           { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      // 编辑角色表单信息
      editRoleForm:{},
      // 当前编辑角色的id
      editRoleId:0
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 更新角色权限
      role.children = res.data
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      this.getLeafKey(role, this.defKeys)
      this.setRightVisible = true
    },
    getLeafKey(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => {
        this.getLeafKey(element, arr)
      })
    },
    setRightDialogClosed() {
      this.defKeys = []
    },
    async setRightsForRole() {
      const keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys()
      ]
      const rids = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.getRolesList()
      this.setRightVisible = false
    },
    // 添加角色对话框关闭
    addRoleDialogClosed() {
      // 重置表单
      this.$refs.addRoleFormRef.resetFields()
    },
    // 添加角色（数据库操作）
    addRoleInfo() {
      // 预校验
      this.$refs.addRoleFormRef.validate(async valid=>{
        if(!valid){
          return
        }
        const {data:res} = await this.$http.post('roles',{
          roleName:this.addRoleForm.roleName,
          roleDesc:this.addRoleForm.roleDesc
        })
        if(res.meta.status !== 201){
          return this.$message.error('添加角色失败')
        }
        // 重新获取角色列表
        this.getRolesList()
        this.addRoleDialogVisible = false
        this.$message.success('添加角色成功')
      })
    },
    // 打开编辑角色对话框，根据id获取角色数据
    async editRole(id){
      // 保存当前编辑角色的id
      this.editRoleId = id
      // 获取角色数据
      const {data:res} = await this.$http.get('roles/' + id)
      if(res.meta.status !== 200){
        return this.$message.error('获取当前角色信息失败')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 编辑角色对话框关闭
    editRoleDialogClosed(){
      // 重置表单
      this.$refs.editRoleFormRef.resetFields()
    },
    // 编辑角色（数据库操作）
    async editRoleInfo(){
      const {data:res} = await this.$http.put('roles/' + this.editRoleId,{
        roleName:this.editRoleForm.roleName,
        roleDesc:this.editRoleForm.roleDesc
      })
      if(res.meta.status !== 200){
        return this.$message.error('编辑提交角色失败')
      }
      // 重新获取角色列表
      this.getRolesList()
      // 关闭编辑角色对话框
     this.editRoleDialogVisible = false
      // 成功提示
      this.$message.success('编辑提交角色成功')
    },
    // 删除角色
    async deleteRole(role){
      // 弹出确认删除对话框
      const deleteResult = await this.$confirm(
        `此操作将永久删除角色${role.roleName}, 是否继续?`,
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
      const { data:res } = await this.$http.delete('roles/' + role.id)
      if(res.meta.status !== 200){
        return this.$message.error('删除角色失败')
      }
      // 重新获取角色列表
      this.getRolesList()
      // 提示成功删除
      this.$message.success(`删除角色${role.roleName}成功`)
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
