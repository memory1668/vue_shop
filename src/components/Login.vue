<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="avatar" />
      </div>
      <!-- 表单区 -->
      <el-form
        label-width="0px"
        ref="loginFormRef"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
      >
        <!-- 用户名 -->
        <el-form-item label prop="username">
          <el-input prefix-icon="iconfont icon-icon" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label prop="password">
          <el-input prefix-icon="iconfont icon-mima" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item label class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单验证规则对象
      loginFormRules: {
        // 验证用户名的规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码的规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      // this.$refs.loginFormRef可以获得Form组件对象，从而调用该对象的resetFields方法重置表单
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 表单预验证
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        // 使用axios发送post请求
        const { data: res } = await this.$http.post('login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        })
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 将token信息保存在浏览器的sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 编程式导航跳转到主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background: #fff;
  border-radius: 3px;
  // 水平垂直居中
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background: #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #eee;
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
