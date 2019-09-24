<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出登录
    logout() {
      // 清空sessionStorage
      window.sessionStorage.clear()
      // 跳转到登录页
      this.$router.push('./login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
