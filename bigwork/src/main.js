import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueCropper from 'vue-cropper'
import ElementUi from 'element-ui'
import '../node_modules/element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUi)

Vue.use(VueCropper)

axios.defaults.withCredentials=true;
Vue.prototype.$axios = axios;

Vue.config.productionTip = false
Vue.use(VueRouter)
const home  = ()=> import('./components/home.vue')
const login = ()=> import ('./components/login.vue')
const register = ()=> import ('./components/register.vue')
const chatBox = ()=> import('./components/chatBox.vue')
const setimg = ()=> import ('./components/setimg.vue')
const test = ()=> import ('./components/test.vue')
const friend = ()=>import('./components/friend.vue')
const infor = ()=>import('./components/infor.vue')
const rePsw = ()=>import('./components/rePsw.vue')
const setFontFamily = ()=>import('./components/setFontFamily.vue')
const webRTC = ()=>import('./components/webRTC.vue')

const routes = [
  {
    name: "webRTC",
    path: "/webRTC",
    component: webRTC
  },
  {
    name: "setFontFamily",
    path: "/setFontFamily",
    component: setFontFamily
  },
  {
    name: "rePsw",
    path: "/rePsw",
    component: rePsw
  },
  {
    name: "infor",
    path: "/infor",
    component: infor
  },
  {
    name: "friend",
    path: "/friend",
    component: friend
  },
  {
    name: "setimg",
    path: "/setimg",
    component: setimg
  },
  {
    name: "test",
    path: "/test",
    component: test
  },
  {
    name: "首页",
    path: '/home',
    component: home,
    children: [
      {
        path: ':id',
        component: chatBox,
        name: '聊天框',
      }
    ]
  },
  {
    path: '/login',
    component: login,
    name: 'login'
  },
  {
    path: '/register',
    component: register,
    name: 'register'
  },

]//route对象映射数组 传入router中
const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/myqq/'
})

router.beforeEach((to,from,next) => {
  
  if (to.name != "login" && to.name != "register" && to.name!="rePsw"){
   var auth = JSON.parse(sessionStorage.getItem("auth"))
   if (auth ==null){
     next('login')
   }
  }
  document.title = to.name;
  next();
})
export default router

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

