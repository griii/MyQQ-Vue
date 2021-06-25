<template>
    <div class="all">
        <div class="cover" v-if="is">
            <h3 style="color: white">{{msg}}</h3>
        </div>
        <h1>添加好友</h1>
        <input id="account" type="text" placeholder="输入账号检索">
        <button @click="find()">搜索</button>
        <div class="userInfor">
            <img :src="require('../assets/Qq ('+user.img+').jpg')" class="userImg">
            <div class="userAccount">{{account}}</div>
            <div class="userName">{{user.name}}</div>
            <button @click="get()" class="btn">添加好友</button>
        </div>
        <button @click="over()" style="margin-bottom:20px;font-size:20px">关闭</button>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: "friend",
    data () {
        return {
            account: "",
            is:false,
            msg: "好友申请已发送,等待对方接受申请",
            user: {
                img:44,
            }
        }
    }
    ,methods: {
        find(){
            var account = document.getElementById("account").value;
            var that = this ;
            this.account = account;
            this.is = true;
            this.msg = "查找中,请稍候..."
            axios.post("https://www.guorii.cn/api/getFriendByAccount?account=" + account).then(res=>{
                if (res.data == null){
                    that.msg = "查无此人!"
                    setTimeout(()=>{that.is = false},1000);
                }else{
                    that.is = false;
                    that.user = res.data;
                }
            })
        },
        get(){
            var that =this;
            axios.post("https://www.guorii.cn/api/sendFriendRequest?toUid=" + that.user.id).then(res=>{
                alert(res.data.msg)
                this.is = true;
                setTimeout(()=>{this.is = false},1000);
            })
        },
        over(){
            this.isSet = false;
            this.$emit("childfn","关闭");
        }
    }
}
</script>

<style scoped>

.btn{
    position:absolute;
    right:10px;
    font-size:15px;
    top:30px;

}
.userAccount{
    position:absolute;
    font-size: 1em;
    top:15px;
    left:60px;
}
.userName{
    position: absolute;
    font-size: 1.5em;
    top:1.5em;
    left:60px
}
.userImg{
    position:absolute;
    left: 5px;
    height:50px;
    width:50px;
    top:15px;
    bottom:15px;
    border:1px solid;
}
.userInfor{
    position: relative;
    margin-top: 20px;
    height:80px;
    width:100%;
    border-top: 1px solid rgb(188,188,188);
    border-bottom: 1px solid rgb(188,188,188);
    margin-bottom: 20px;
}
.all{
    position: relative;
    width:20%;
    border: 1px solid;
    border-radius: 30px;
    background: honeydew;
    text-align: center;
}
.cover{
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left:0;
    width:100%;
    height:100%;
    background-color: rgba(0,0,0,0.5);
    border-radius: 30px;
    z-index: 2;
}
</style>