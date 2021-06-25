<template>
    <div class="box">
        <div class="cover" v-if="isSet">
            <setimg @childfn="parentfn" style="position:absolute" v-if="isSetImg"></setimg>
            <friend @childfn="parentfn" style="position:absolute" v-if="isGetFriend"></friend>
            <infor @childfn="parentfn" style="position:absolute" v-if="isGetInfor"></infor>
        </div>
        <div class="selectBox" v-if="select.length">
            <div class="selectTop"></div>
            <div class="selectBottom">
                <div v-for="(sel,index) in select" :key=index>
                    <router-link :chatMsgs="chatMsgs"  tag="span" :to="'/home/' + sel.roomId" >
                        <div :class="sel.isSelect?'selectBottomBoxSelect':'selectBottomBox'" @click="selectLink(index)">
                        <img :src="require('../assets/Qq ('+sel.img+').jpg')" class="selectBoxImg">
                        <div class="selectBoxName">
                            {{sel.name}}
                        </div>
                        <div class="selectBoxMsg">{{sel.msg}}</div>
                        <div class="selectBoxDate">{{sel.date}}</div>
                        <div class="selectBoxTip" v-if="sel.tips > 0">{{sel.tips}}</div>
                    </div>
                    </router-link>
                </div>
            </div>
        </div>
        <router-view></router-view>
        <div class="right">
            <div class="top">
                <div class="infor">
                    <div class="myInfor">
                        <img :src="require('../assets/Qq ('+myImg+').jpg')" class="selectBoxImg">
                        <p>{{myName}}</p>
                        <img style="width:20px;height:20px;margin-left:20px" src="../assets/头像.png" @click="setImging()" alt="更换头像" title="更换头像">
                        <img style="width:20px;height:20px;margin-left:5px" src="../assets/消息.png" @click="getInfor()" title="消息">
                        <img style="width:20px;height:20px;margin-left:5px" src="../assets/添加好友.png" @click="getFriend()" title="添加好友">
                        
                    </div>
                </div>
            </div>
            <div class="bottom">
                <div class="select">
                    <div class="selectLeftHover" v-if="isMsg">消息</div>
                    <div class="selectLeft" v-else @click="gotoMsg()">消息</div>
                    <div class="selectRightHover" v-if="isFamily">联系人</div>
                    <div class="selectRight" v-else @click="gotoFamily()">联系人</div>
                </div>
                <div class="bottomBox">
                    <div v-if="isMsg">
                        <div v-for="(m,index) in msg" :key=index>
                        <div class="msgBox" @dblclick="selectMsgBox(m.roomId,index)">
                        <img :src="require('../assets/Qq ('+m.img+').jpg')" class="leftImg">
                        <div class="rightAll">
                            <div class="rightTop">
                                {{m.name}}
                            </div>
                            <div class="rightBottom">
                                {{m.msg}}
                            </div>
                        </div>
                        <div class="rightDate">{{m.date}}</div>
                        <div class="rightTip" v-if="m.tips > 0">{{m.tips}}</div>
                        </div>
                        </div>
                    </div>
                    <div v-else>
                        <div v-for="(family,index) in families" :key=index>
                            <div class="familyName" @click="selectFamily(index)">
                                <div v-if="familyIsSelect[index]">
                                    <img style="width:12px;height:12px;margin-right:5px" src="../assets/right.png">{{family.name}}
                                </div>
                                <div v-else>
                                    <img style="width:12px;height:12px;margin-right:5px" src="../assets/down.png">{{family.name}}
                                </div>
                            </div>
                            <div v-if="familyIsSelect[index]">
                                <div v-for="(f,index) in family.family" :key=index>
                                <div class="msgBox">
                                <img :src="require('../assets/Qq ('+f.img+').jpg')"  class="leftImg">
                                <div class="rightAll">
                                <div class="rightTop">
                                {{f.name}}
                            </div>
                            </div>
                            </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!stompClient.connected" class="allLoading">
            <div class="loading">加载中...请稍候</div>
        </div>
    </div>
</template>
<script>
import router from '../main.js'
import JSON from 'JSON'
import Axios from 'axios'
import socketjs from 'sockjs-client'
import stomp from 'stompjs'
import setimg from './setimg.vue'
import friend from './friend.vue'
import infor from './infor.vue'
import openSocket from '../openSocket'
export default {
    components: {
      setimg,friend,infor
    },
    name: 'home',
    created(){
        this.stompClient = openSocket.stompClient;
        this.connected = this.stompClient.connected;
        console.log(this.connected)
        if (this.connected){
            this.openSocket();
        }else{
            var timer = setInterval(()=>{
                if (openSocket.stompClient.connected){
                    this.connected = true;
                    clearInterval(timer)
                    this.openSocket()
                }
            },100)
        }
        this.friends = JSON.parse(sessionStorage.getItem("auth")).friendsList;
        this.rooms = JSON.parse(sessionStorage.getItem("auth")).roomsList;
        this.families = [{"name": "好友","family": this.friends},{"name":"群聊","family":this.rooms}]
        console.log(this.rooms)
        if (sessionStorage.getItem("select") != null){
        this.select = JSON.parse(sessionStorage.getItem("select"))
        }
        //home登录过后，获取全局的webSocket 通过uid为唯一标识进行监视webSocket
        //发送消息:携带uid，roomId发送 后端通过roomId找到所有的用户对象 检测当前已登录的对象 向其一一发送...
        this.chatMsgs = JSON.parse(sessionStorage.getItem("chatMsgs"))
        this.updataRooms();
    },

    // watch:{
    //     $route(to,old){
    //         //检测如果是跳转到聊天窗口则向sessionstorege中添加chatMsgs
    //         if (to.name == "聊天框"){
    //             var roomId = to.params.id;
    //             var chatMsgs = sessionStorage.getItem("chatMsgs");
    //             if (chatMsgs == null){
    //                 //根据jsession和roomId去获取后端的聊天信息，这里先跳过
    //                 var data = [{
    //                     "roomId": roomId,
    //                     "msgs": [
    //                         {
    //                             "uid": 1,
    //                             "msg": "哈哈哈",
    //                         },{
    //                             "uid": 2,
    //                             "msg": "嘿嘿嘿"
    //                         }
    //                     ]
    //                 },{
    //                      "roomId": roomId,
    //                     "msgs": [
    //                         {
    //                             "uid": 1,
    //                             "msg": "哈哈哈",
    //                         },{
    //                             "uid": 2,
    //                             "msg": "嘿嘿嘿"
    //                         }
    //                     ]
    //                 }
    //                 ];
    //                 chatMsgs = data;
    //             }else{
    //                 chatMsgs = JSON.parse(sessionStorage.getItem("chatMsgs"))
    //                 //session中已经存在了...检测是否存在相同roomId的对象，然后向后端发起请求
    //                 for (var index =0;index<chatMsgs.length;index++){
    //                     if (chatMsgs[index].roomId == roomId){
    //                         console.log(this.chatMsgs)

    //                         console.log("已经存在该roomId的msg信息,跳出");
    //                         return 
    //                     }
    //                 }
    //                 var data = {
    //                     "roomId": roomId,
    //                     "msgs": [
    //                         {
    //                             "uid": 1,
    //                             "msg": "哈哈哈",
    //                         },{
    //                             "uid": 2,
    //                             "msg": "嘿嘿嘿"
    //                         }
    //                     ]
    //                 };
    //                 chatMsgs.push(data);
    //             }
    //             sessionStorage.setItem("chatMsgs",JSON.stringify(chatMsgs))
    //             this.chatMsgs = JSON.parse(sessionStorage.getItem("chatMsgs"));
    //             console.log(this.chatMsgs)
    //         }
    //     }
    // },
    methods: {
        parentfn(msg){
            console.log("子组件通过事件向父组件传值")
            console.log(msg)
            if (msg == "关闭"){
                this.overSet();
            }else{
                this.overSet();
                //否则就是修改头像的信息
                if (msg!=""){
                this.myImg = msg;
                }
            }
        },
        overSet(){
            this.isSet = false;
            this.isSetImg = false;
            this.isGetFriend = false;
            this.isGetInfor = false;
        },
        getInfor(){
            this.isSet = true;
            this.isGetInfor = true;
        },
        getFriend(){
            this.isSet = true;
            this.isGetFriend = true;
        },
        setImging(){
            this.isSet = true;
            this.isSetImg = true;
        },
        openSocket(){
            var that = this;
            var roomId = this.$route.params.id;
            var stompClient = this.stompClient;
            console.log(stompClient)
            stompClient.subscribe('/topicHome/' + JSON.parse(sessionStorage.getItem("auth")).id,function(msg){
                        //console.log("监听收到广播消息,在home页面只收新消息...因为没开chatBox时完整消息是没有用的，home页面只显示最近的一条消息")
                       // console.log(JSON.parse(sessionStorage.getItem("auth")).id)
                        //console.log("接收到本用户的消息,修改home页面的msg")
                        //修改chatMsg,不然切换房间之后消息不会出现...
                        console.log("这里是home页面的监听到了消息")
                        if (JSON.parse(msg.body).timeStamp != that.timeStamp){
                        that.timeStamp =JSON.parse(msg.body).timeStamp;
                        var newMsg = JSON.parse(msg.body);
                        var oldMsg = that.msg;
                        var roomIdN = that.$route.params.id;
                        if (newMsg.content == "窗口抖动"){
                            //将这个页面设成第一页面
                            let roomId = newMsg.roomId;
                            var msg = that.msg;
                            console.log(msg)
                            for (let x=0;x<msg.length;x++){
                                if (msg[x].roomId == roomId){
                                    console.log("找到了...index等于" + x)
                                    that.selectMsgBox(roomId,x)
                                    break;
                                }
                            }
                            return;
                        }
                        if (newMsg.content == "请求加为好友"){
                            console.log("接收到好友请求,home页面进行处理");
                            alert("有新的好友请求! " + newMsg.name + "请求加为好友")
                            return;
                        }
                        if (newMsg.content == "我同意了你的好友请求"){
                             that.updataRooms();
                        }
                        for (let x=0;x<oldMsg.length;x++){
                            if (oldMsg[x].roomId == newMsg.roomId){
                                if (roomIdN != null && oldMsg[x].roomId != roomIdN){
                                that.msg[x].tips ++;
                                }
                                that.msg[x].msg = newMsg.content;
                                var sel = that.select;
                                for (let index=0;index<sel.length;index++){
                                    if (sel[index].roomId == oldMsg[x].roomId){
                                        sel[index].tips = that.msg[x].tips;
                                        sel[index].msg = newMsg.content;
                                    }
                                }
                                if (x==0){
                                    break
                                }
                                let m = that.msg;
                                let temp = m[x];
                                for (let index=m.length-1;index>0;index--){
                                  
                                    m[index] = m[index-1];
                               
                                }
                                m[0] = temp;
                                that.msg = m;
                                
                                break;
                            }
                        }
                        //console.log("如果没有找到新消息的房间信息，则说明是新的聊天窗口，需要push一个聊天信息...")
                        //console.log("将新消息放在本页面msg数组的第一位..")
            }})
                
            
        
            
        },
        
        updataRooms(){
            //更新所有房间信息(页面初次加载时调用，后面监听路由调用)
            Axios.get(
                 "https://www.guorii.cn/api/getRooms"
            ).then(
                res=>{
                    if (res.data.msg == "获取成功"){
                        var myImg = JSON.parse(sessionStorage.getItem("auth")).img;
                        var myName =  JSON.parse(sessionStorage.getItem("auth")).name;
                    
                        //向该页面的msg传入
                        var roomMsg = res.data.obj;
                        var roomImgs = [];
                        var roomNames = [];
                        for (let index=0;index<roomMsg.length;index++){
                            if (roomMsg[index].img.charAt(0) == "|"){
                                //说明这个room只有两个人
                                roomNames = roomMsg[index].name.substring(1,roomMsg[index].name.length-1).split("|");
                                roomImgs = roomMsg[index].img.substring(1,roomMsg[index].img.length-1).split("|");
                                if (roomImgs[0] == myImg){
                                    roomMsg[index].img = roomImgs[1]
                                }else{
                                    roomMsg[index].img = roomImgs[0]
                                }
                                if (roomNames[0]==myName){
                                    roomMsg[index].name = roomNames[1]
                                }else{
                                    roomMsg[index].name = roomNames[0]
                                }
                            }
                        }
                        this.msg = res.data.obj;
                    
                    }else{
                        alert(this.msg)
                    }
                }
            )
        },
        selectLink(index){
            var sel = this.select;
            for (var x=0;x<sel.length;x++){
                sel[x].isSelect = false;
            }
            this.select[index].isSelect = true;
            this.select[index].tips = 0;
            var m = this.msg;
            for (let x=0;x<m.length;x++){
                if (m[x].roomId == sel[x].roomId){
                    m[x].tips = 0;
                }
            }
            this.msg = m;
            sessionStorage.setItem("select",JSON.stringify(this.select))
        },
        selectMsgBox(roomId,index){
                var chatMsgs = sessionStorage.getItem("chatMsgs");
                Axios.get('https://www.guorii.cn/api/getMsgByRoomId?id=' + roomId + '&page=' + 1).then
                (res=>{
                    var msgs = res.data.obj;
                    if (chatMsgs == null){
                    //根据jsession和roomId去获取后端的聊天信息，这里先跳过
                    var data = [{
                        "roomId": 0,
                        "msgs": [
                            
                        ]
                    },{
                         "roomId": roomId,
                        "msgs": msgs
                    }
                    ];
                    chatMsgs = data;
                }else{
                    chatMsgs = JSON.parse(sessionStorage.getItem("chatMsgs"))
                    //session中已经存在了...检测是否存在相同roomId的对象，然后向后端发起请求
                   
                    for (var a =0;a<chatMsgs.length;a++){
                    
                        if (chatMsgs[a].roomId == roomId){
                            var sel = this.select;
                            for (var x=0;x<sel.length;x++){
                                sel[x].isSelect = false;
                            }
                            this.select[index].tips = 0;
                            this.select[index].isSelect = true;
                            sessionStorage.setItem("select",JSON.stringify(this.select))
                            router.replace('/home/' + roomId)
                            this.msg[index].tips = 0;
                            return 
                        }
                    }
                   
                    var data = {
                        "roomId": roomId,
                        "msgs":  msgs
                    };
                    chatMsgs.push(data);
                }
                sessionStorage.setItem("chatMsgs",JSON.stringify(chatMsgs))
                this.chatMsgs = JSON.parse(sessionStorage.getItem("chatMsgs"));
                var select = this.select;
                for (var x=0;x<select.length;x++){
                select[x].isSelect = false
                if (select[x].name == this.msg[index].name){
                    select[x].isSelect = true;
                    for (x=x+1;x<select.length;x++){
                        select[x].isSelect = false;
                    }
                    router.replace('/home/' + roomId)
                    return
                }
            }
            router.replace('/home/' + roomId)
            this.msg[index].tips = 0;
            var sel = this.msg[index];
            select.push({'name':sel.name,'tips':sel.tips,'date': sel.date,'img':sel.img,'isSelect': true,'roomId': sel.roomId,"msg": sel.msg})
            sessionStorage.setItem("select",JSON.stringify(this.select))
            })
        },
        gotoMsg (){
            this.isMsg = true;
            this.isFamily = false;
        },
        gotoFamily (){
            this.isMsg = false;
            this.isFamily = true;
        },
        selectFamily(index) {
            var f = []
            for (var x=0;x<this.familyIsSelect.length;x++){
                f[x] = false;
            }
            f[index] = true;
            this.familyIsSelect = f;
        },
    },
    data(){
        return {
            isGetInfor: false,
            isGetFriend: false,
            isSet: false,
            isSetImg: false,
            myImg: JSON.parse(sessionStorage.getItem("auth")).img,
            myName:JSON.parse(sessionStorage.getItem("auth")).name,
            timeStamp: 123,
            stompClient: null,
            L: 0,
            chatMsgs: [],
            isFamily: false,
            isMsg: true,
            familyIsSelect: [false,false],
            chatMsgs: [],
            select: [
            ],
            friends:[{"id":1,"name":"郭睿","img":"53"},{"id":3,"name":"吴汪键","img":"15"}],
            rooms:[{"id":3,"name":"郭睿是汪建爹","img":"25"},{"id":4,"name":"咕噜咕噜","img":"11"}],
            families:[
                {
                    name: '好友',
                    family: [
                        {
                            name: '郭睿',
                            img: '头像',
                        },
                        {
                            name: '丁世元',
                            img: '头像',
                        },
                        {
                            name: '浩泉',
                            img: '头像'
                        }
                    ]
                },
                {
                    name: '朋友',
                    family:[
                        {
                            name: '嘿嘿',
                            img: '头像'
                        },
                        {
                            name: '哈哈',
                            img: '头像'
                        }
                    ]
                }
            ],
            msg:[
                
            ],
        }
    }
    
}
</script>

<style scoped>
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
    z-index: 2000;
}
.allLoading{
        position: absolute;
        width:100%;
        height:100%;
        background-color: rgba(235, 235, 235, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .loadging{
        font-size: 40px;
        color: blue;
        font-weight: bold;
    }
.selectBox{
    width:13%;
    height: 80%;
    border: 1px solid;
    background-color: aliceblue;
}
.selectTop{
    height: 10%;
    width: 100%;
    background-color: lightgray;
}
.selectBottom{
    height:90%;
    width: 100%;
}
.selectBottomBox{
    cursor: default;
    width: 100%;
    height: 60px;
    background-color: rgb(240,240,240);
    display: flex;
    align-items: center;
    position: relative
}
.selectBottomBoxSelect{
    cursor: default;
    width: 100%;
    height: 60px;
    background-color: rgb(200,200,200);
    display: flex;
    align-items: center;
    position: relative
}
.selectBoxImg{
    width:50px;
    height:50px;
}
.selectBoxName{
    font-size: 13px;
    display: flex;
    margin-top: -25px;
    margin-left: 5px;

}
.selectBoxMsg{
    font-size: 10px;
    color: #737373;
    position: absolute;
    top: 30px;
    left:55px;
}
.selectBoxDate{
        position:absolute;
        right:5px;
        top:5px;
        font-size:10px;
        color:rgb(200,200,200)
}
.selectBoxTip{
     position:absolute;
        right:5px;
        top:25px;
        border: 0.5px solid rgb(235,235,235);
        border-radius: 15px;
        font-size:0.8em;
        background-color: rgb(247,76,49);
        padding-left: 6px;
        padding-right: 6px;
        color:white;
}
.familyName{
    width:100%;
    height: 30px;
    font-size:12px;
    display: flex;
    justify-content: left;
    align-items: center;
    cursor: default;
}
.familyName:hover{
    background-color: rgb(235,235,235);
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
    .right{
        height: 90%;
        position: absolute;
        top: 5%;
        right: 5%;
        width:300px;
        border: 1px solid;
        cursor: default;
        user-select: none;
    }
    .right .top{
        height: 15%;
        width: 100%;
        background-color: rgb(230,230,230);
    }
    .right .top .infor{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: left;
        align-items: center;
    }
    .myInfor{
        height:50px;
        display: flex;
        margin-left: 10px;
        justify-content: center;
        align-items: center;
        font-size: 20px;
    }
    .right .top .get{
        
        width: 100%;
        height: 30%;
        border-top: 1px solid black
    }
    .right .bottom{
        width: 100%;
        height: 85%;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
        background-color: aliceblue;
    }
    .bottomAll{
        width: 100%;
        height: 100%;
        position: absolute;
        background-color: aliceblue;
    }
    .right .bottom .select{
        width: 100%;
        height: 12%;
        background-color: white;
        border-top: 0.5px rgb(235,235,235);
        border-bottom: 0.5px rgb(235,235,235);
        display: flex;
        justify-content: center;
        align-items: center;

    }
    .selectLeft{
        cursor: default;
        width: 50%;
        height: 100%;
        color: rgb(94,104,117);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .selectRight{
        cursor: default;
        width: 50%;
        height: 100%;
        color: rgb(94,104,117);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .bottomBox{
        width:100%;
        background-color: white;
    }
    .selectLeftHover{
        cursor: default;
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        border-bottom: 2px solid black
    }
    .selectRightHover{
        cursor: default;
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: black;
        border-bottom: 2px solid black
    }
    .msgBox{
        width:100%;
        height:15%;
        position:relative;
    }
    .msgBox:hover{
        background-color: rgb(235,235,235);
    }
    .leftImg{
        width: 50px;
        height: 50px;
        position: relative;
    }
    .rightAll{
        top: 2px;
        left: 55px;
        position: absolute;
        height:100%;
    }
    .rightTop{
        color: black;
        font-size:20px;
    }
    .rightBottom{
        color:rgb(215,215,215);
        font-size: 1em;
        overflow: hidden;
        height: 20px;
    }
    .rightDate{
        position:absolute;
        right:5px;
        top:5px;
        font-size:10px;
        color:rgb(215,215,215)
    }
    .rightTip{
        position:absolute;
        right:5px;
        top:25px;
        border: 0.5px solid rgb(235,235,235);
        border-radius: 15px;
        font-size:0.8em;
        background-color: rgb(247,76,49);
        padding-left: 6px;
        padding-right: 6px;
        color:white;
    }
    
</style>