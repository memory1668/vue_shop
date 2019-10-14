// 上线时会用到的babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  // 用来移除console语句的插件
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  'presets': [
    '@vue/app'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    // 上线环境用到的插件
    ...prodPlugins,
    // 路由懒加载用到的组件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
