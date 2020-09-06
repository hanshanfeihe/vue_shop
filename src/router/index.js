import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)
const routes = [{
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]
const router = new VueRouter({
  routes
})
// 路由导航守卫
// to将要访问的路径
// from原来的路径
// next()直接放行 next('/login')强制跳转到登录页
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 从sessionStorage获取保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
