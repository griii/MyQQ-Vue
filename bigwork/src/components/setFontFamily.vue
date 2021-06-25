<template>
<div class="all">
  <span :style="'font-family:' + fontFamily + ';font-size:' + (0.8+ (shape/20)) + 'em;' + 'color:' + color">字体测试</span>
  <el-select v-model="fontFamily" placeholder="字体" :style="'width:100px;font-family:' + fontFamily">
      <el-option
        v-for="item in families"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :style="'font-family:' + item.value"
        >
      </el-option>
  </el-select>
  <el-select v-model="shape" placeholder="大小" style="width:100px">
      <el-option
        v-for="item in 10"
        :key="item.value"
        :label="item"
        :value="item"
      >
      </el-option>
  </el-select>
  <el-select v-model="color" :style="'width:100px;color:' + color" placeholder="颜色">
      <el-option
        v-for="item in colors"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :style="'color:' + item.value">
      </el-option>
  </el-select>
  <button @click="ok()">完成</button>
    <button @click="over()">取消</button>
</div>
</template>

<script>
import axios from 'axios'
import JSON from 'JSON'
export default {
    name: 'setFontFamily',
    created(){
      var f = JSON.parse(sessionStorage.getItem("auth")).fontFamily.split(";");
      this.fontFamily = f[0];
      this.shape = f[1];
      this.color = f[2]
    },
    data() {
      return{
         families: [{
          value: 'SimSun',
          label: '宋体'
        }, {
          value: 'SimHei',
          label: '黑体'
        }, {
          value: 'KaiTi',
          label: '楷体'
        }, {
          value: 'MingLiU',
          label: '细明体'
        }], 
        colors: [{
          value: 'black',
          label: '黑'
        },{
          value: 'red',
          label: '红'
        }, {
          value: 'orange',
          label: '橙'
        }, {
          value: 'yellow',
          label: '黄'
        }, {
          value: 'green',
          label: '绿'
        }, {
          value: 'blue',
          label: '蓝'
        }], 
        color: '',
        fontFamily: '',
        shape: '',
      }
    },
    methods: {
        ok(){
            var f = this.fontFamily + ";" + this.shape + ";" + this.color;
            axios.post("https://www.guorii.cn/api/updateFontFamily?fontFamily=" + f).then(res=>{
                console.log(res)
            })
            var a = JSON.parse(sessionStorage.getItem("auth"))
            a.fontFamily = f;
            sessionStorage.setItem("auth",JSON.stringify(a))
            this.$emit("childfn","关闭");
        },
        over(){
            this.$emit("childfn","关闭");
        }
    }
}

</script>

<style scoped>
.all{
    position: relative;
    width:100%;
    border: 1px solid;
    border-radius: 30px;
    background: honeydew;
    text-align: center;
}
</style>