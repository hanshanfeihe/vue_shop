# vue-shop

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
#### 项目简介

    前后端分离的电商后台管理项目，包括登录验证，用户管理，权限管理，商品管理，数据统计模块功能。
 
#### 项目技术栈
##### 前端
- vue脚手架
    - vue-router 编程式导航
- ui 
    - element-ui 
    
    按需引入（体积小），主要使用了element-ui中的表单，表单验证，导航，分页栏，进度条，按钮，图标，表格，面包屑导航，模态框，tabs标签等组件
- 接口调用axios
- 项目打包 webpack
    主要优化:将体积大的模块采用cdn引入，如项目中的element-ui,富文本编辑器

#### 后台
- node.js
- mysql 
- express
接口采用 jwt验证
需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
使用 HTTP Status Code 标识状态
数据返回格式统一使用 JSON
跨域支持
