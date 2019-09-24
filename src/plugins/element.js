import Vue from 'vue'
import { Button, Form, Input, FormItem, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 挂载Meassage
Vue.prototype.$message = Message
