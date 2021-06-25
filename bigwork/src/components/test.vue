<template>
<div>
    <button @click="sendOffer()">向丁世元发送聊天申请</button>
    <button @click="getSrc()">查看两个视频的src</button>
    <div key="isSrc">我的src{{mySrc}}</div>
    <div key="isSrc">他的src{{otherSrc}}</div>
    <video id="Me"></video>
    <video id="Other" controls="true"></video>
</div>
</template>

<script>
import openSocket from '../openSocket'
export default {
    name: 'test',
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
                    stompClient.subscribe('/topicRTC/' + JSON.parse(sessionStorage.getItem("auth")).id,function(msg){
                        console.log("这里是视频聊天页面监听到了消息")
                        var cil = JSON.parse(msg.body);
                        if (cil.type == "offer"){
                          var peer = that.otherPeer;
                          console.log(peer)
                          console.log("这里是接收方，接收到郭睿聊天邀请啦~~~,回复给他~")
                          var offerSdp = new RTCSessionDescription(cil);
                          console.log(offerSdp)
                          peer.setRemoteDescription(offerSdp).then(() => {
                            navigator.mediaDevices.getUserMedia({ audio: true, video: false }) 
                              .then(stream => {
                                console.log(1)
                                var video = document.getElementById('Me');
                                video.srcObject = stream;
                                stream.getTracks().forEach(track => {
                                  peer.addTrack(track, stream);
                              });
                              peer.createAnswer().then(answer => {
                                console.log(1)
                                peer.setLocalDescription(answer)
                                that.stompClient.send("/app/rtc",{},JSON.stringify({content: JSON.stringify(answer),uid: 4}));
                              });
                            })
                          });
                        }else if(cil.type == "answer"){
                          console.log("这里是视频发起方，收到了丁世元的应答")
                          var peer = that.otherPeer;
                          console.log(peer)
                          peer.setRemoteDescription(new RTCSessionDescription(cil)).then(()=>{
                            console.log("发起方设置完毕")
                            console.log(peer)
                          })
                        }else if(cil.type=="offer_ice"){
                          console.log("监听到了ice消息")
                          console.log(cil)
                          var peer = that.otherPeer;
                          if (peer.remoteDescription){
                            console.log("已经设置完毕，可以add！")
                            peer.addIceCandidate(JSON.parse(cil.iceCandidate))
                          }else{
                            console.log("接收到信令，但是还没有设置完毕，不添加")
                          }
                        }
                    })
        },
        async createMedia() {
            this.localstream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            let video = document.getElementById('Me');
            console.log(this.localstream)
            video.srcObject = this.localstream;
            this.initPeer(); // 获取到媒体流后，调用函数初始化 RTCPeerConnection
        },
        initPeer() {
          console.log("初始化两个peer")
            this.myPeer.addStream(this.localstream); // 添加本地流
            this.myPeer.onicecandidate = (event) => {
            // 监听 A 的ICE候选信息 如果收集到，就添加给 B 连接状态
            console.log("me(郭睿)监听到了候选信息，向对方(丁世元)发送信令")
                if (event.candidate) {
                    this.stompClient.send("/app/rtc",{},JSON.stringify({
                      content:JSON.stringify({
                      type: 'offer_ice',
                      iceCandidate: JSON.stringify(event.candidate),
                    }),
                      uid: 2//发送给接收方
                    }
                  ))
                }
            };
            // 监听是否有媒体流接入，如果有就赋值给 rtcB 的 src
            this.otherPeer.ontrack = (event) => {
              console.log("监听到有媒体流")
              console.log(event.streams[0])
                let video = document.getElementById('Other');
                video.srcObject = event.streams[0];
                video.play();
            };
            this.otherPeer.onicecandidate = (event) => {
              if (event.candidate) {
                  this.stompClient.send("/app/rtc",{},JSON.stringify({
                    content:JSON.stringify({
                      type: 'offer_ice',
                      iceCandidate: JSON.stringify(event.candidate),
                    }),
                      uid: 4//发送给发起方
                    }))
                }
            };
        },
       sendOffer(){
         var peer = this.otherPeer;
                var stream = this.localstream;
                console.log(stream)
                stream.getTracks().forEach(track => {
                  peer.addTrack(track, stream);
              });
              peer.createOffer().then(offer => {
                  peer.setLocalDescription(offer);
                  this.stompClient.send("/app/rtc",{},JSON.stringify({uid: 2,content: JSON.stringify(offer)}))
              });
        }
    }
}

</script>