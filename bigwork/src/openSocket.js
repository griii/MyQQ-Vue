import socketjs from 'sockjs-client'
import stomp from 'stompjs'

console.log(socketjs)
var socket = new socketjs('https://www.guorii.cn/api/chat/');
//var socket = new socketjs('http://localhost:8001/api/chat/');

var stompClient = stomp.over(socket);
stompClient.debug = null;
stompClient.connect();

setInterval(()=>{
stompClient.send("ping",{},"ping")
},30000)

export default{stompClient}