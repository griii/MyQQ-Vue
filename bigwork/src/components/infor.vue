<template>
    <div class="all">
        <button @click="over()" class="overBtn">关闭</button>
        <h1>消息</h1>
        <div v-for="(i,index) in infor" :key="index">
            <div class="userInfor">
            <img class="userImg" :src="require('../assets/Qq ('+i.img+').jpg')">
            <div class="userAccount">{{i.account}}</div>
            <div class="userName">{{i.name}}</div>
            <div class="text">好友申请</div>
            <button @click="resT(i.id,index)" v-if="!i.read" class="btn1">接受</button>
            <button @click="resF(i.id,index)" v-if="!i.read" class="btn">拒绝</button>
            <div class="text1" v-if="i.read">{{i.finalMsg}}</div>
            </div>
        </div>
    </div>
</template>

<script>
import JSON from 'JSON'
import axios from 'axios'
export default {
    name: "infor",
    created () {
      this.getAllInfor();  
    },
    methods: {
        resT(id,index){
            var that = this;
            axios.post("https://www.guorii.cn/api/resInfor?fromUid=" + id + "&finalMsg=已同意").then(res=>{
                that.getAllInfor();
            })
        },
        resF(id,index){
            axios.post("https://www.guorii.cn/api/resInfor?fromUid=" + id + "&finalMsg=已拒绝").then(res=>{
                that.getAllInfor();
            })
        },
        getAllInfor(){
            var that = this;
          axios.post("https://www.guorii.cn/api/getAllInfor").then(res=>{
              console.log(res)
              var data = res.data;
              if (data.status == 200){
                  that.infor = data.obj;
              }
          })  
        },
    over(){
        this.$emit("childfn","关闭");
    }  
    },
    data () {
        return {
            infor:[
                
            ]
        }
    }
}
</script>

<style scoped>
.overBtn{
    position:absolute;
    top:20px;
    right:20px;
    font-size:20px;
}
.text1{
    position: absolute;
    top:40px;
    color:blue;
    right:15px;
    font-size:1em;
}
.btn1{
    position:absolute;
    font-size:0.8em;
    top:35px;
    right:65px;
}
.btn{
    position:absolute;
    font-size:0.8em;
    top:35px;
    right:10px;
}
.text{
    color:red;
    position :absolute;
    top:15px;
    right:15px;
    font-size:0.8em;
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
    width:40px;
    height:40px;
    border:1px solid;
    position:absolute;
    left:10px;
    top:20px;
}
.userInfor{
    height:80px;
    width:100%;
    position:relative;
    border-top: 1px solid rgb(188,188,188);
    border-bottom: 1px solid rgb(188,188,188);
}
.all{
    position: relative;
    width:30%;
    height:500px;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid;
    border-radius: 30px;
    background: honeydew;
    text-align: center;
}
</style>