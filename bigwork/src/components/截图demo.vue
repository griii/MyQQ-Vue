<template>
<div>
<div id="test">
  <button @click="selectImg()">截图</button>
  <button id="over" class="over" @click="uploadImg()">结束</button>
  <h1>测试</h1><h1>测试</h1><h1>测试</h1><h1>测试</h1><h1>测试</h1><h1>测试</h1><h1>测试</h1><h1>测试</h1>
<img :src="img" style="width:2%;height:2%">
</div>
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


</div>
  
</template>

<script>
import { VueCropper } from 'vue-cropper'
import html2canvas from "html2canvas"
export default {
  name: "CropperImage",
  components: {
    VueCropper
  },
  data() {
    return {
      img: "",
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
      }
    };
  },
  methods: {
    //选择图片
    selectImg (e) {
      html2canvas(document.getElementById("test")).then(canvas => {
          let dataURL = canvas.toDataURL("image/png");
          this.option.img = dataURL;
          this.isSelect = "";
          document.getElementsByClassName("cropper-move")[1].appendChild(document.getElementById("over"))
          console.log(document.getElementsByClassName("cropper-move"))
          return ;
        });
    },
    //上传图片
    uploadImg (type) {
      console.log(1)
      let _this = this;
        //获取截图的blob数据
        this.$refs.cropper.getCropBlob(async (data) => {
          let img = window.URL.createObjectURL(data);
          this.img = img;
          console.log(img)
          let formData = new FormData();
          formData.append('file',data,"DX.jpg")
          console.log(formData)
          _this.$refs.cropper.stopCrop()
          _this.$refs.cropper.clearCrop();
          _this.isSelect = "none";
          return;
          //调用axios上传
          let {data: res} = await _this.$http.post('/api/file/imgUpload', formData)
          if(res.code === 200){
            _this.$message({
              message: res.msg,
              type: "success"
            });
            let data = res.data.replace('[','').replace(']','').split(',');
            let imgInfo = {
              name : _this.Name,
              url : data[0]
            };
            _this.$emit('uploadImgSuccess',imgInfo);
          }else {
            _this.$message({
              message: '文件服务异常，请联系管理员！',
              type: "error"
            });
          }
        })
      
    },
  },
}
</script>

<style scoped lang="scss">
.over{
  background-color: aliceblue;
  color: black;
position:absolute;
bottom: 0;
right:0;
}
.cropper-content{
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