<template>
<div class="box">
    <div class="all">
        <div class="top">
            <img style="width:28px;height: 33px;" src="../assets/MyQQ.png">
            <span style="font-size:30px;color:red;">MyQQ</span>
        </div>
        <div class="toast" v-show="toastShow">
				{{toastText}}
			</div>
        <div class="title">
            登 录
        </div><br>
        <input v-model="account" class="input" placeholder="输入账号">
        <input v-model="psw" @keydown.enter="login" class="input" type="password" placeholder="输入密码">
        <input type="button" @click="login" class="btn" value="登录">
        <router-link to="/register" class="login-link">还未拥有账号?</router-link>
        <router-link to="/rePsw" class="login-link">忘记密码?</router-link>
        <div style="height:30px"></div>
    </div>
</div>
</template>

<script>
import axios from 'axios'
import router from '../main.js'
import JSON from 'JSON'

export default {
    name: 'login',
    computed: {
        userId(){
            return this.$route.params.uid
        }
    },
    methods: {
        toastOver(){
            this.toastShow = false;
        },
        toastShowing(str){
            let v = this
			v.toastText = str
			v.toastShow = true
        },
        toastShowTime(str,time) {
						let v = this
						v.toastText = str
						v.toastShow = true
						setTimeout(function() {
							v.toastShow = false
						}, time)
					},
        login(){
            if (this.account == "" || this.psw == ""){
                this.toastShowTime("请输入完整后登陆");
                return;
            }
            this.toastShowing("登录中...")
            axios.post("https://www.guorii.cn/api/login?username=" + this.account + "&password=" + this.psw)
            //axios.post("http://localhost:8001/api/login?username=" + this.account + "&password=" + this.psw)
            .then(res =>{
                this.toastOver()
                if (res.data.msg=="登录成功！"){
                    var auth = res.data.principal;
                    console.log(auth)
                    sessionStorage.setItem('auth',JSON.stringify(auth))
                    router.replace('home')
                }else{
                    this.toastShowTime(res.data.msg,1500)
                }
            })
        }
    },
    data(){
        return {
            account: "",
            psw: "",
            toastShow: false,
            toastText: "",
        }
    }
}

</script>
<style scoped>
.toast {
			position: fixed;
			z-index: 2000;
			left: 50%;
			top: 45%;
			transition: all .5s;
			-webkit-transform: translateX(-50%) translateY(-50%);
			-moz-transform: translateX(-50%) translateY(-50%);
			-ms-transform: translateX(-50%) translateY(-50%);
			-o-transform: translateX(-50%) translateY(-50%);
			transform: translateX(-50%) translateY(-50%);
			text-align: center;
			border-radius: 5px;
			color: white;
			background: rgba(17, 17, 17, 0.7);
			margin-left: 30px;
            margin-right: 30px;
			line-height: 45px;
			padding: 0 15px;
			max-width: 150px;
		}
    .top{
        position: relative;
        left: 10%;
        width: 80%;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .box{
        width: 100%;
        height: 100%;        
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgb(52,152,219);
    }
    .all{
        width: 300px;
        margin-top: -100px;
        border-radius: 10px;
        background-color: white;
        position: relative;
    }
    .title{
        font-size: 30px;
        font-weight: bold;
        color: rgb(119,119,119);
        display: flex;
        justify-content: center;
        position: relative;
        top: 10px;
    }


    input {
        text-align: center;
        background-color: #ECF0F1;
        border: 2px solid transparent;
        border-radius: 3px;
        font-size: 16px;
        font-weight: 200;
        padding: 10px 0;
        width: 80%;
        transition: border .5s;
        position: relative;
        left: 10%;
        margin-top: 10px;
    }

    input:focus {
        border: 2px solid #3498DB;
        box-shadow: none;
    }

    .btn {
        cursor: pointer;
        border: 2px solid transparent;
        background: #3498DB;
        color: #ffffff;
        font-size: 16px;
        line-height: 25px;
        padding: 10px 0;
        text-decoration: none;
        text-shadow: none;
        border-radius: 3px;
        box-shadow: none;
        transition: 0.25s;
        display: block;
        width: 80%;
        position: relative;
        left:10%;
    }
    .login-link {
        font-size: 12px;
        color: #444;
        display: block;
        margin-top: 12px;
        text-align: center;
    }
</style>