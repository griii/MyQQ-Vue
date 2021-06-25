<template>
    <div class="box">
    <div class="all">
        <div class="toast" v-show="toastShow">
				{{toastText}}
			</div>
        <div class="top">
            <img style="width:28px;height: 33px;" src="../assets/MyQQ.png">
            <span style="font-size:30px;color:red;">MyQQ</span>
        </div>
        <div class="title">
            注 册
        </div><br>
        <input id="name" class="input" placeholder="输入昵称">
        <input id="account" class="input" placeholder="输入账号(仅数字)" oninput = "value=value.replace(/[^\d]/g,'')">
        <input id="email" class="input" placeholder="输入邮箱(用于找回密码)" type="mail">
        <input id="password" class="input" type="password" placeholder="输入密码">
        <input id="password1" class="input" type="password" placeholder="确认密码">
        <input type="button" @click="register()" class="btn" value="注册">
        <router-link to="/login" class="login-link">返回登录</router-link>
        <div style="height:30px"></div>
    </div>
</div>
</template>
<script>
import axios from 'axios'
import router from '../main.js'

export default {
    name: 'register',
    data () {
        return {
            toastShow: false,
            toastText: "",
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
        register(){
            var account = document.getElementById("account").value;
            var name = document.getElementById("name").value;
            var password = document.getElementById("password").value;
            var password1 = document.getElementById("password1").value;
            var email = document.getElementById("email").value;
            var that = this;
            if (account =="" || name == "" || password == ""||password1==""||email==""){
                this.toastShowTime("请输入全部信息后注册!",1500)
                return;
            }
            if (password !== password1){
                this.toastShowTime("两次密码输入不同,注册失败!",1000);
                return;
            }
            console.log("注册" + account)
            this.toastShowing("注册中...")
            axios.post("https://www.guorii.cn/api/register?account="+ account + "&name=" + name + "&password=" + password + "&email=" + email).then(res=>{
                this.toastOver();
                console.log(res)
                if (res.data.msg != "注册成功"){
                    this.toastShowTime(res.data.msg,1000)
                }else{
                    this.toastShowing("注册成功,返回登录...")
                    setTimeout(()=>{
                        router.replace('login')
                        this.toastShow = false;
                    },1000)
                }
            })
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
        width:80%;
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