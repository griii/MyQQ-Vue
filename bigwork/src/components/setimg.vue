<template>
    <div class="all">
        <div class="cover" v-if="isSet">
            <div class="tip">
                是否选择
                <span><img  :src="require('../assets/Qq ('+setIndex+').jpg')"></span>
                作头像?
                <br>
                <button @click="setImg()">确定</button>
                <button @click="finishSet()">取消</button>
                <h3 v-if="is">{{msg}}</h3>
            </div>
        </div>
        <h3 style="text-align: center">更换头像</h3><button @click="over()" style="position:absolute;right:20px;top:15px;font-size:30px;">关闭</button>
            <span v-for="(x,index) in 105" :key = "index">
                <span><img @click="set(x)" :src="require('../assets/Qq ('+x+').jpg')"></span>
            </span>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: "setimg",
    data () {
        return {
            isSet: false,
            setIndex: "",
            msg:"更换中,请稍候...",
            is:false,
        }
    },
    methods: {
        setImg(){
            //更新头像
            var that = this;
            this.msg = "更换中,请稍候..."
            this.is = true;
            axios.post("https://www.guorii.cn/api/updateMyImg?img=" + that.setIndex).then(res=>{
                that.is = false;
                alert(res.data.msg)
                that.over();
            })
        },
        over(){
            this.isSet = false;
            console.log("子组件开始传值...")
            this.$emit("childfn",this.setIndex);
        },
        finishSet(){
            this.isSet = false;
        },
        set(x){
            this.isSet = true;
            this.setIndex = x;
        },
    }
}
</script>

<style scoped>
.tip{
     display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
    z-index: 3;
    background: honeydew;
    border: 1px solid;
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
.all{
    position: relative;
    width:100%;
    border: 1px solid;
    border-radius: 30px;
    background: honeydew;
}
.imgs{
    white-space: nowrap;
    font-size:0;
}
img{
    margin: 5px 5px 5px 5px;
    padding: 2px 2px 2px 2px;
    display: inline-block;
    border: 1px solid;
    width: 40px;
    height:40px 
}
img:hover{
    background: rgba(0,0,0,0.5);
}
</style>