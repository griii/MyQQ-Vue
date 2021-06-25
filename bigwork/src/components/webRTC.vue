<template>
<div class="all">
    <video class="big" :style="'display:' + isDisplay" id="Me"  autoplay playsinline muted></video>
    <video class="small" :style="'display:' + isDisplay" id="Other"  autoplay playsinline></video>
</div>
</template>

<script>
import openSocket from '../openSocket'
export default {
    name: 'webRTC',
    created(){
      this.createMedia();
      this.myPeer = new RTCPeerConnection(
    {
      iceServers: [
        { urls: "stun:stun.counterpath.net:3478"},
      ]
    });
    this.otherPeer = new RTCPeerConnection(
    {
      iceServers: [
        { urls: "stun:stun.counterpath.net:3478"},
      ]
    });
      this.stompClient = openSocket.stompClient;
        this.connected = this.stompClient.connected;
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
    },
    data() {
      return{
         stompClient: null,
         connected: false,
         myPeer: null,
         otherPeer: null,
         mySrc: "",
         otherSrc: "",
         isSrc: 1,
         myUid: 0,
         toUid: 0,
         ices: [],
         localstream: "0",
         ing: false,
         otherIsAll: false,
         isDisplay: "none",
      }
    },
    methods: {
      getSrc(){
        this.mySrc = document.getElementById("Me").srcObject;
        this.otherSrc = document.getElementById("Other").srcObject;
        this.isSrc ++;
      },
      openSocket(){
            var that = this;
            this.stompClient = openSocket.stompClient;
            var stompClient = this.stompClient;
            var myId = JSON.parse(sessionStorage.getItem("auth")).id
                    stompClient.subscribe('/topicRTC/' + JSON.parse(sessionStorage.getItem("auth")).id,async function(msg){
                        console.log("接收到了...")
                        var body = JSON.parse(msg.body)
                        if (body.content == "refuse"){
                          alert("对方拒绝了你的视频邀请!")
                          that.closePeer()
                          return;
                        }
                        var cil = JSON.parse(body.content);
                        if (cil.type == "offer"){
                            that.myUid = body.myUid;
                            that.toUid = body.toUid;
                          var peer = that.otherPeer;
                          console.log(peer)
                          var req = confirm("接收到别人的视频邀请，是否接受邀请?")
                          if (req){
                          console.log("接受邀请...")
                          console.log("开始创建media")
                          //await that.createMedia();
                          console.log("开始初始化peer")
                          that.initPeer();
                          var offerSdp = new RTCSessionDescription(cil);
                          console.log(offerSdp)
                          peer.setRemoteDescription(offerSdp).then(() => {
                            navigator.mediaDevices.getUserMedia({ audio: true, video: false }) 
                                var stream = that.localstream
                                stream.getTracks().forEach(track => {
                                  peer.addTrack(track, stream);
                              });
                              peer.createAnswer().then(answer => {
                                console.log(1)
                                peer.setLocalDescription(answer)
                                that.stompClient.send("/app/rtc",{},JSON.stringify({content: JSON.stringify(answer),uid: that.myUid}));
                              });
                          });}else{
                            console.log("发送拒绝信号")
                                that.stompClient.send("/app/rtc",{},JSON.stringify({content: "refuse",uid: that.myUid}));
                          }
                        }else if(cil.type == "answer"){
                          console.log("这里是视频发起方，收到了丁世元的应答")
                          var peer = that.otherPeer;
                          console.log(peer)
                          peer.setRemoteDescription(new RTCSessionDescription(cil)).then(()=>{
                            console.log("发起方设置完毕,将之前的所有ice信令数组放出来")
                            var ice = that.ices;
                            for (let index=0;index<ice.length;index++){
                                peer.addIceCandidate(ice[index])
                            }
                          })
                        }else if(cil.type=="offer_ice"){
                          console.log("监听到了ice消息")
                          console.log(cil)
                          var peer = that.otherPeer;
                          if (peer.remoteDescription){
                            console.log("已经设置完毕，可以add！")
                            console.log(JSON.parse(cil.iceCandidate).candidate == "")
                            if (JSON.parse(cil.iceCandidate).candidate == ""){
                                console.log("无效的信令,无视")
                            }else{
                                peer.addIceCandidate(JSON.parse(cil.iceCandidate))
                            }
                          }else{
                            if (JSON.parse(cil.iceCandidate).candidate == ""){
                                console.log("无效的信令,无视")
                            }else{
                            console.log("接收到信令，但是还没有设置完毕，添加到数组中等待设置完毕后统一添加")
                            that.ices.push(JSON.parse(cil.iceCandidate))
                            }
                          }
                        }
                    })
        },
        closePeer(){
          document.getElementById("Other").className = "small";
          document.getElementById("Me").className = "big";
          this.ing = false;
          this.isDisplay = "none",
          console.log("执行两个peer的close方法")
          this.myPeer.close();
          this.otherPeer.close();
        },
        async createMedia() {
          this.ing = true;
          if (this.localstream != "0"){
            return;
          }
            this.localstream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            let video = document.getElementById('Me');
            console.log(this.localstream)
            video.srcObject = this.localstream;
            console.log("media创建完毕")
        },
        initPeer() {
          this.isDisplay = ""
          console.log("初始化两个peer")
            this.myPeer.addStream(this.localstream); // 添加本地流
            this.myPeer.onicecandidate = (event) => {
            // 监听 A 的ICE候选信息 如果收集到，就添加给 B 连接状态
            console.log("myPeer监听到了候选信息，发送信令")
                if (event.candidate) {
                    this.stompClient.send("/app/rtc",{},JSON.stringify({
                      content:JSON.stringify({
                      type: 'offer_ice',
                      iceCandidate: JSON.stringify(event.candidate),
                    }),
                      uid: this.myUid//发送给接收方
                    }
                  ))
                }
            };
            // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
            this.otherPeer.ontrack = (event) => {
              console.log("监听到有媒体流，将自己的视频缩小，别人的视频放大")
              document.getElementById("Me").className = "small";
              document.getElementById("Other").className = "big";
              console.log(event.streams[0])
                let video = document.getElementById('Other');
                video.srcObject = event.streams[0];
                video.play();
            };
            this.otherPeer.onicecandidate = (event) => {
            console.log("otherPeer监听到了候选信息，发送信令")
              if (event.candidate) {
                  this.stompClient.send("/app/rtc",{},JSON.stringify({
                    content:JSON.stringify({
                      type: 'offer_ice',
                      iceCandidate: JSON.stringify(event.candidate),
                    }),
                      uid: this.toUid//发送给发起方
                    }))
                }
            };
        },
       sendOffer(){
           console.log("webRTC组件中的sendOffer被调用...")
            var peer = this.otherPeer;
                var stream = this.localstream;
                console.log(stream)
                stream.getTracks().forEach(track => {
                  peer.addTrack(track, stream);
              });
              peer.createOffer().then(offer => {
                  peer.setLocalDescription(offer);
                  this.stompClient.send("/app/rtc",{},JSON.stringify({uid: this.toUid,content: JSON.stringify(offer),myUid: this.myUid,toUid: this.toUid}))
              });
        }
    }
}

</script>

<style scoped>
.all{
  width:100%;
  height:100%;
  position:relative;
  z-index: 55;
}
.big{
  width: 100%;
  height: 100%;
  position:absolute;
  left: 0;
  top: 0;
}
.small{
  width: 150px;
  height:150px;
  position: absolute;
  right:0;
  bottom:75px;
  z-index: 100;
}
</style>

