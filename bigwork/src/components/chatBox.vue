<template>
    <div class="chatBox" id="capture">
        <div class="cover1" v-if="isSetFontFamily">
            <setFontFamily @childfn="parentfn" style="position:absolute" v-if="isSetFontFamily"></setFontFamily>
        </div>
        <div v-if="!stompClient.connected || loading" class="allLoading">
            <div class="loading">加载中...请稍候</div>
        </div>
<button id="over" class="over" @click="uploadImg()">结束</button>
<div class="cropper-content" :style="'display:' + isSelect">
    <div class="cropper-box" id="crop" :style="'display:' + isSelect">
      <div class="cropper">
        <vue-cropper
            ref="cropper"
            :img="option.img"
            :outputSize="option.outputSize"
            :outputType="option.outputType"
            :info="option.info"
            :canScale="option.canScale"
            :autoCrop="option.autoCrop"
            :autoCropWidth="option.autoCropWidth"
            :autoCropHeight="option.autoCropHeight"
            :fixed="option.fixed"
            :fixedNumber="option.fixedNumber"
            :full="option.full"
            :fixedBox="option.fixedBox"
            :canMove="option.canMove"
            :canMoveBox="option.canMoveBox"
            :original="option.original"
            :centerBox="option.centerBox"
            :height="option.height"
            :infoTrue="option.infoTrue"
            :maxImgSize="option.maxImgSize"
            :enlarge="option.enlarge">
        </vue-cropper>
      </div>
    </div>
</div>

        <div style="width:100%;height:100%;z-index:5;position:absolute;top:0;left:0" v-show="toastShow">
            <div class="toast">
				{{toastText}}
		    </div>
        </div>
        <div class="top">
            {{roomInfor.msg}}
        </div>
        <div class="bottom">
            <div class="chatMsg" id="chatContent">
                <div class="getMore" v-if="canGetMore" @click="getMoreMsg()">^^^获取历史消息^^^</div>
                <div style="align-items: center" v-for="(msg,index) in msgs.msgs" :key="index">
                    <div class="myMsg" v-if="msg.uid == myId">
                            <div class="MyMsgText" v-if="msg.msg.substring(0,8) == '[//@img:'">
                                <img style="height:100%;width:100%" :src="'https://www.guorii.cn/img/' + msg.msg.substring(8) + '.jpg'">
                            </div>
                            <div class="MyMsgText" v-else-if="msg.msg.substring(0,9) == '[//@file:'">
                                <img src="../assets/文件.png"> 文件:{{msg.fileName}} 
                                <button @click="download('https://www.guorii.cn/file/'+msg.url)">下载</button>
                            </div>
                            <div class="MyMsgText" v-else 
                            :style="'font-family:' + myFontFamily.split(';')[0] + ';font-size:' + (0.8+ (myFontFamily.split(';')[1]/20)) + 'em;' + 'color:' + myFontFamily.split(';')[2]"
                            :key="isUpdate"
                            >{{msg.msg}}<span v-if="msg.sending == 1">发送中</span>
                            <div v-if="msg.sending==1"><img style="width:30px;height:30px" src="../assets/加载.png"></div>
                            </div>
                        <div class="myImg">
                            <img :src="require('../assets/Qq ('+msg.img+').jpg')">
                        </div>
                    </div>
                    <div class="otherMsg" v-else>
                        <div class="OtherMsgName">{{msg.name}}</div>
                        <div class="OtherMsgText" v-if="msg.msg.substring(0,8) == '[//@img:'">
                                <img style="height:100%;width:100%" :src="'https://www.guorii.cn/img/' +  msg.msg.substring(8) + '.jpg'">
                        </div>
                        <div class="OtherMsgText" v-else-if="msg.msg.substring(0,9) == '[//@file:'">
                                <img src="../assets/文件.png"> 文件:{{msg.fileName}}
                                <button @click="download('https://www.guorii.cn/file/'+msg.url)">下载</button>
                            </div>
                        <div class="OtherMsgText" v-else
                        :style="'font-family:' + msg.fontFamily.split(';')[0] + ';font-size:' + (0.8+ (msg.fontFamily.split(';')[1]/20)) + 'em;' + 'color:' + msg.fontFamily.split(';')[2]"
                        >{{msg.msg}}</div>
                        <div class="otherImg">
                            <img :src="require('../assets/Qq ('+msg.img+').jpg')">
                        </div>
                    </div>
                </div>
            </div>
            <div class="options">
                <img title="修改字体" @click="setFontFamily()" class="optionImg" src="../assets/字体.png" alt="修改字体">
                <img v-if="isSimple" title="窗口抖动" @click="sendShaking()" class="optionImg" src="../assets/窗口抖动.png" alt="窗口抖动">
                <img v-if="isSimple" title="视频" @click="sendRTC()" class="optionImg" src="../assets/视频.png" alt="视频">
                <img title="截图" @click="selectImg()" class="optionImg" src="../assets/截图.png" alt="截图">
                <div class="optionImg" alt="上传文件">
                    <input @change="loadFile()" id="file" type="file" value="上传文件" style="position: absolute;">
                </div>
            </div>
            <div class="chatInput">
                <div class="inputBox">
                    <textarea id="chatInput" v-model="inputText" @keydown.enter="insertMsg()" class="inputB"></textarea>
                </div>
                <div class="btns">
                    <button @click="insertMsg()" class="btnSubmit">
                        发送
                    </button>
                    
                </div>
            </div>
            <div class="chatInfor">
                <div v-for="(infor,index) in roomInfor.obj" :key="index">
                    <div class="chatInforUser">
                        <div class="cover" v-if="!infor.online"></div>
                    <img class="chatInforUserImg" :src="require('../assets/Qq ('+infor.img+').jpg')">
                        {{infor.name}} ({{infor.account}})
                    </div>
                </div>
            </div>
        </div>
                <webRTC ref="webRTC"></webRTC>

    </div>
</template>
<script>
import { VueCropper } from 'vue-cropper'
import html2canvas from "html2canvas"
import axios from 'axios'
import router from '../main'
import JSON from 'JSON'
import openSocket from '../openSocket'
import setFontFamily from './setFontFamily'
import webRTC from './webRTC'
export default {
    components: {setFontFamily,webRTC},
    name: 'chatBox',
    mounted () {
      this.gotoBottom(); 
    },
    created(){
        this.updateRoomInfor();
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
        var roomId = this.$route.params.id
        var msgs = JSON.parse(sessionStorage.getItem("chatMsgs"));
            for (var index=0;index<msgs.length;index++){
                if (msgs[index].roomId == roomId){
                    this.msgs = msgs[index];
                    this.canGetMore = msgs[index].msgs.length<15?false:true;
                }
            }
        this.setFile();
    },
    watch:{
        canSend(to,old){
            console.log(to)
            if (to){
                this.toastShow = false;
            }
        },
        msg(to,old){
            this.gotoBottom();
            this.setFile();
        },
        msgs(to,old){
            this.setFile();
            console.log("msgs发生了改变")
            console.log(old)
            console.log(to)
        },
        $route(to,old){
            //route改变
            console.log("route改变")
            console.log(to.name)
            if (to.name=="聊天框"){
                //获取聊天室用户信息
                this.updateRoomInfor();
            }
            this.gotoBottom();
            var msgs = JSON.parse(sessionStorage.getItem("chatMsgs"));
            for (var index=0;index<msgs.length;index++){
                if (msgs[index].roomId == to.params.id){
                    console.log(msgs[index])
                    this.msgs = msgs[index];
                    break;
                }
            }
        }
    },
    methods: {
        async sendRTC(){
            console.log("聊天框界面发送视频聊天请求")
            var myUid = JSON.parse(sessionStorage.getItem("auth")).id;
            console.log("我的id" + myUid)
            var roomInfor = this.roomInfor.obj;
            if (roomInfor[0].id == myUid){
                var other = roomInfor[1]
            }else{
                var other = roomInfor[0]
            }
            console.log("目标id" + other.id + "目标是否在线" + other.online)
            if (!other.online){
                alert("目标不在线,无法发送视频聊天请求!")
                return;
            }
            console.log("目标在线，发送视频请求，调用webRTC子组件中的send函数")
            var webRTC = this.$refs.webRTC
            webRTC.myUid = myUid;
            webRTC.toUid = other.id;
            await webRTC.createMedia();
            webRTC.initPeer();
            webRTC.sendOffer();
        },
        setFontFamily(){
            this.isSetFontFamily = true;
        },
        overSet(){
            this.isUpdate ++ ;
            this.isSetFontFamily = false;
        },
        parentfn(msg){
            this.overSet();
        },
        download(url){
            console.log("下载" +url)
            var elemIF = document.createElement('iframe')
            elemIF.src = url
            elemIF.style.display = 'none'
            elemIF.download = "下载";
            document.body.appendChild(elemIF)
        },
        setFile(){
            var msg = this.msgs.msgs;
            for (let index=0;index<msg.length;index++){
                if (msg[index].msg.substring(0,9) == '[//@file:'){
                    var f = JSON.parse(msg[index].msg.substring(9))
                    msg[index].url = f.url;
                    msg[index].fileName = f.fileName;
                }
            }
            this.msgs.msgs = msg;
            console.log(this.msgs.msgs)
        },
        loadFile(){
            var roomId = this.$route.params.id;
            var uid = JSON.parse(sessionStorage.getItem("auth")).id;
            var name = JSON.parse(sessionStorage.getItem("auth")).name;
            var myimg = JSON.parse(sessionStorage.getItem("auth")).img;
            var length = this.msgs.msgs.length;
            var file = document.getElementById("file").files;
            var _this = this;
            console.log(file[0].size / 1024 + "kb")
            console.log(file[0])
            if (file[0].size / 1024 > 6000){
                alert("不能上传超过5MB的File!")
                return;
            }
            var fd = new FormData();
            fd.append("file", file[0]);
             axios.post("https://www.guorii.cn/api/loadFile",fd).then(res=>{
                 console.log(res.data)
                 let url = res.data.msg;
                 let fileName = file[0].name;
                 let fu = {url,fileName}
                  let fileUrl = "[//@file:" + JSON.stringify(fu);
                    var data = {
                        date: "123",
                        msg: fileUrl,
                        roomId: roomId,
                        uid: uid,
                        sending: 1,
                        img: myimg,
                        name: name,
                        fileName: fileName,
                        url: url
                    }
                    _this.msgs.msgs.push(data)
                    _this.stompClient.send("/app/test",{},JSON.stringify({"content": fileUrl,roomId: roomId,uid: uid,img: myimg,name: name,length: length,fileName: fileName,url: url}));
                    _this.gotoBottom();
                    })
        },
        updateRoomInfor(){
            var roomId = this.$route.params.id;
            axios.get("https://www.guorii.cn/api/getRoomInfor?roomId=" + roomId).then(res=>{
                var infor  = res.data;
                var roomName = infor.msg;
                if (roomName[0] == '|' && roomName[roomName.length-1] == "|"){
                    this.isSimple = true;
                }else{
                    this.isSimple = false;
                }
                if (infor.obj.length > 1){
                    infor.obj.sort(function(a,b){
                        return b.online;
                    })
                }
                this.roomInfor = infor;
                this.loading = false;
            })
        },
        sendShaking(){
            var roomId = this.$route.params.id;
            var uid = JSON.parse(sessionStorage.getItem("auth")).id;
            var name = JSON.parse(sessionStorage.getItem("auth")).name;
            var img = JSON.parse(sessionStorage.getItem("auth")).img;
            var roomId = this.$route.params.id;
            console.log("发送窗口抖动")
            this.stompClient.send("/app/test",{},JSON.stringify({"content": "窗口抖动",roomId: roomId,uid: uid,img: img,name: name}));
        },
        shaking(){
            var div = document.getElementById("capture")
            var a = true;
            var timer = setInterval(function() {
            let left = div.style.left;
            console.log(left)
                div.style.left = (a ? -5 : 5) + 'px';//这样可以实现小幅度的抖动效果，但是大幅度的抖动就会显得很生硬　　　
                div.style.top = (a ? -5 : 5) + 'px';
                a = !a;
            }, 30);
            setTimeout(()=>{
                div.style.left = 0 +'px';//这样可以实现小幅度的抖动效果，但是大幅度的抖动就会显得很生硬　　　
                div.style.top = 0+ 'px';
                clearInterval(timer);
            },3000)
        },
         selectImg (e) {
            html2canvas(document.getElementById("capture")).then(canvas => {
            let dataURL = canvas.toDataURL("image/png");
            this.option.img = dataURL;
            this.isSelect = "";
            var a = document.getElementById("over");
            a.style.display = "";
            document.getElementsByClassName("cropper-move")[1].appendChild(a)
            console.log(document.getElementsByClassName("cropper-move"))
            return ;
        });
    },
    //上传图片
    uploadImg (type) {
        var roomId = this.$route.params.id;
            var uid = JSON.parse(sessionStorage.getItem("auth")).id;
            var name = JSON.parse(sessionStorage.getItem("auth")).name;
            var myimg = JSON.parse(sessionStorage.getItem("auth")).img;
            var length = this.msgs.msgs.length;
      let _this = this;
        //获取截图的blob数据
        this.$refs.cropper.getCropBlob(async (d) => {
          let img = window.URL.createObjectURL(d);
          console.log(img)
          console.log(d)
          var fd = new FormData();
            fd.append("file", d);
          _this.$refs.cropper.stopCrop()
          _this.$refs.cropper.clearCrop();
          _this.isSelect = "none";
          document.getElementById("over").style.display = "none";
          axios.post("https://www.guorii.cn/api/loadImg",fd).then(res=>{
              let imgUrl = "[//@img:" + res.data.msg;
              var data = {
                date: "123",
                msg: imgUrl,
                roomId: roomId,
                uid: uid,
                sending: 1,
                img: myimg,
                name: name
            }
            _this.msgs.msgs.push(data)
              console.log(imgUrl)
              _this.stompClient.send("/app/test",{},JSON.stringify({"content": imgUrl,roomId: roomId,uid: uid,img: myimg,name: name,length: length}));
                _this.gotoBottom();
          })
          
            
        //   let imgInput = document.createElement("img");
        //   imgInput.className = "imgInput";
        //   imgInput.src = img;
        //   imgInput.style = "width:40%;height:40%";
        //   document.getElementById("chatInput").appendChild(imgInput)
          })
        },

        openSocket(){
            var that = this;
            this.stompClient = openSocket.stompClient;
            var stompClient = this.stompClient;
            var myId = JSON.parse(sessionStorage.getItem("auth")).id
                    stompClient.subscribe('/topicChat/' + JSON.parse(sessionStorage.getItem("auth")).id,function(msg){
                        console.log("这里是chatBox页面监听到了消息")
                        //这里只处理当前房间的消息
                        if (JSON.parse(msg.body).timeStamp != that.timeStamp){
                        that.timeStamp = JSON.parse(msg.body).timeStamp;
                        var roomId = that.$route.params.id;
                        var newMsg = JSON.parse(msg.body);
                        if (newMsg.content == "请求加为好友"){
                            console.log("接收到好友请求,聊天框不进行处理,由home处理");
                            return;
                        }
                        if (newMsg.content == "窗口抖动"){
                            console.log("接收到窗口抖动...开始抖动")
                            that.shaking();
                            return;
                        }
                        if (newMsg.roomId == roomId){
                            var data = {
                                    "uid": newMsg.uid,
                                    "roomId": newMsg.roomId,                
                                    "msg": newMsg.content,
                                    "img": newMsg.img,
                                    "name": newMsg.name
                                }
                                var msgs = JSON.parse(sessionStorage.getItem("chatMsgs"));
                                for (var index=0;index<msgs.length;index++){
                                    if (msgs[index].roomId == that.$route.params.id){
                                        msgs[index].msgs.push(data);
                                        break;
                                    }
                                }
                                sessionStorage.setItem("chatMsgs",JSON.stringify(msgs));
                            if (newMsg.uid == myId){
                                that.msgs.msgs[newMsg.length].sending = 0;
                            }else{
                                
                                that.msgs.msgs.push(data)
                                that.setFile()
                                that.gotoBottom();
                            }
                        }
                        }
                    })
        },
        getMoreMsg(){
            var that = this;
            this.page ++;
            var page = this.page;
            var roomId = this.$route.params.id;
            axios.get("https://www.guorii.cn/api/getMsgByRoomId?id=" + roomId + '&page=' + page)
            .then(res=>{
                var msgN = res.data.obj;
                that.canGetMore = msgN.length<15?false:true;
                var msgOld = that.msgs.msgs;
                for (let index=0;index<msgOld.length;index++){
                    msgN.push(msgOld[index])
                }
                that.msgs.msgs = msgN;
            })
        },
        gotoBottom(){
            var content = document.getElementById("chatContent")
            var timer = setInterval(()=>{
                if (content.scrollHeight - content.scrollTop === content.clientHeight){
                    clearInterval(timer)
                }else{
                    content.scrollTop = content.scrollHeight;
                }
            },100)
        },
        updateMsg(text,uid){
            var msgs = JSON.parse(sessionStorage.getItem("chatMsgs"))
            var roomId = this.$route.params.id;
            var data = {
                date: "123",
                msg: text,
                roomId: roomId,
                uid: uid,
            }
            for (var index=0;index<msgs.length;index++){
                if (msgs[index].roomId == roomId){
                    msgs[index].msgs.push(data)
                    break;
                }
            }
            sessionStorage.setItem("chatMsgs",JSON.stringify(msgs))
            this.msgs = msgs[index];
            this.gotoBottom();
        },
        insertMsg(){
            var msgs = JSON.parse(sessionStorage.getItem("chatMsgs"))
            var roomId = this.$route.params.id;
            var uid = JSON.parse(sessionStorage.getItem("auth")).id;
            var name = JSON.parse(sessionStorage.getItem("auth")).name;
            var img = JSON.parse(sessionStorage.getItem("auth")).img;
            var text = this.inputText;
            var length;
            var data = {
                date: "123",
                msg: text,
                roomId: roomId,
                uid: uid,
                sending: 1,
                img: img,
                name: name,
            }
            length = this.msgs.msgs.length;
            // console.log(msgs.length)
            // for (var index=0;index<msgs.length;index++){
            //     console.log("数组中的id：" + msgs[index].roomId + "当前页面id" + roomId)
            //     if (msgs[index].roomId == roomId){
            //         msgs[index].msgs.push(data)
            //         length = msgs[index].msgs.length - 1;
            //         console.log("在这里改变length...")
            //         break;
            //     }
            // }
            // sessionStorage.setItem("chatMsgs",JSON.stringify(msgs))
            // msgs[index].msgs[length].sending = 1;
            // console.log(this.msgs)
            // this.msgs = msgs[index];
            // console.log(this.msgs)
            // length = this.msgs.msgs.length;
            // console.log(this.msgs)
            
            if (this.canSend){
            this.inputText = "";
            this.msgs.msgs.push(data)
             this.gotoBottom();
            this.stompClient.send("/app/test",{},JSON.stringify({"content": text,roomId: roomId,uid: uid,length: length,img: img,name: name}));
            this.canSend = false;
            setTimeout(()=>{
                this.canSend = true;
            },500)
            }else{
                if (!this.toastShow)
               this.toastShowing("输入间隔不能超过500毫秒！")
            }
        },
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
    },
    data(){
        return {
            isSimple: false,
            isUpdate: 1,
            myFontFamily: JSON.parse(sessionStorage.getItem("auth")).fontFamily,
            isSetFontFamily: false,
            isSelect: "none",
            option:{
                img: '',             //裁剪图片的地址
                outputSize: 1,       //裁剪生成图片的质量(可选0.1 - 1)
                outputType: 'jpeg',  //裁剪生成图片的格式（jpeg || png || webp）
                info: true,          //图片大小信息
                canScale: false,      //图片是否允许滚轮缩放
                autoCrop: true,      //是否默认生成截图框
                autoCropWidth: 200,  //默认生成截图框宽度
                autoCropHeight: 100, //默认生成截图框高度
                fixed: false,         //是否开启截图框宽高固定比例
                fixedNumber: [1.53, 1], //截图框的宽高比例
                full: false,         //false按原比例裁切图片，不失真
                fixedBox: false,      //固定截图框大小，不允许改变
                canMove: false,      //上传图片是否可以移动
                canMoveBox: true,    //截图框能否拖动
                original: false,     //上传图片按照原始比例渲染
                centerBox: true,    //截图框是否被限制在图片里面
                height: true,        //是否按照设备的dpr 输出等比例图片
                infoTrue: false,     //true为展示真实输出图片宽高，false展示看到的截图框宽高
                maxImgSize: 3000,    //限制图片最大宽度和高度
                enlarge: 1,          //图片根据截图框输出比例倍数
                mode: '230px 150px'  //图片默认渲染方式
            },
            canSend: true,
            myId: JSON.parse(sessionStorage.getItem("auth")).id,
            router: router,
            msgs:{},
            inputText: "",
            isTop: null,
            canGetMore: false,
            page: 1,
            timeStamp: 123,
            stompClient: null,
            roomInfor: [],
            loading: true,
        }
    }
}
</script>

<style scoped>
.imgInput{
    width: 40%;
    height: 40%;
}
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
    .allLoading{
        z-index: 999;
        position: absolute;
        width:100%;
        height:100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .loadging{
        font-size: 40px;
        color: blue;
        font-weight: bold;
    }
    .getMore{
        width: 100%;
        height:20px;
        font-size: 13px;
        color: rgb(225,225,225);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    
    img{
        width:40px;
        height:40px
    }
    .chatMsg .myMsg{
        margin-top: 30px;
        margin-bottom: 30px;
        width: 100%;
        position: relative;
        text-align: right;
    }
    .MyMsgText{
        position: relative;
        display: inline-block;
        top: 10px;
        font-size: 12px;
        background-color: rgb(225,225,225);
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 10px;
        padding-bottom: 10px;
        border-radius: 10px;
        margin-right: 55px;
    }
    
    .chatMsg .myMsg .myImg{
        width: 50px;
        height: 50px;
        position:absolute;
        right: 0%;
        top:0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .chatMsg .otherMsg{
        margin-top: 30px;
        margin-bottom: 30px;
        width: 100%;
        position: relative;
    }
    .chatMsg .otherMsg .otherImg{
        width: 50px;
        height: 50px;
        position:absolute;
        left: 0%;
        top:0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .OtherMsgName{
        position:absolute;
        top:1px;
        left:55px;
        font-size: 10px;
        color: rgb(185,185,185)
    }
    .OtherMsgText{
        position: relative;
        display: inline-block;
        top: 20px;
        font-size: 12px;
        background-color: rgb(225,225,225);
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 10px;
        padding-bottom: 10px;
        border-radius: 10px;
        margin-left: 55px;
    }
    .chatBox{
        border: 1px solid;
        position: relative;
        width: 40%;
        height: 80%;
        margin-right: 200px;
        border: 1px solid;
        background-color: aliceblue;
    }
    .top{
        position: relative;
        width: 100%;
        height: 10%;
        background-color: lightblue;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .top .x{
        position:absolute;
        top:0%;
        right: 0%;
        height: 100%;
        width: 50px;
        background-color: red;
    }
    .bottom{
        height:90%;
        width: 100%;
    }
    .bottom .chatInfor{
        height:90%;
        width:28%;
        position:absolute;
        top:10%;
        right:0;
        border-left: 1px solid rgb(235,235,235);
    }
    .chatInforUser{
        height:35px;
        position:relative;
        display: flex;
        align-items: center;

        font-size: 0.5em;
        color: rgb(155, 155, 155);
    }
    .chatInforUser:hover{
        background: rgba(0, 0, 0, 0.5);
    }
    .chatInforUserImg{
        height: 30px;
        width: 30px;
        margin-right: 10px;
    }
    .cover1{
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
    .cover{
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
    }
    .bottom .chatMsg{
        height:65%;
        width:70%;
        position: relative;
        left:0;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .bottom .chatInput{
        height: 29%;
        width: 70%;
        position:relative;
        left:0;
    }
    .bottom .options{
        border-top: 1px solid rgb(235,235,235);
        background-color: white;
        height: 6%;
        width: 70%;
        position: relative;
        left: 0;
        display: flex;
        align-items: center;
    }
    .optionImg{
        margin-left: 10px;
        width: 20px;
        height: 20px;
        position: relative;
    }
    .optionImg:hover{
        background: rgba(5, 5, 5, 0.5);
    }
    .bottom .chatInput .inputBox{
        height: 66%;
        width: 100%;
    }
    .bottom .chatInput .inputBox .inputB{
        resize: none;
        width:100%;
        height:100%;
        overflow: auto;
    }
    .bottom .chatInput .btns{
        height: 33%;
        width: 100%;
        display: flex;
        position: relative;
        align-items: center;
    }
    .bottom .chatInput .btns .btnSubmit{
        border: 0.5px solid rgb(200,200,200);
        width: 50px;
        height: 50%;
        font-size: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 10px;
        border-radius: 5px;
    }
    .bottom .chatInput .btns .btnEsc{
        background-color: aliceblue;
        border: 0.5px solid rgb(200,200,200);
        width: 50px;
        height: 50%;
        font-size: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 80px;
        border-radius: 5px;

    }
</style>

<style scoped lang="scss">
.over{
  background-color: aliceblue;
  color: black;
position:absolute;
bottom: 0;
right:0;
}
.cropper-content{
    z-index: 100;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  .cropper-box{
    position: absolute;
    flex: 1;
    width: 100%;
      height: 100%;
    .cropper{
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
}
</style>