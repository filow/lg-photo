<template>
  <div class="Drag">
    <Social @select="onSelect"/>
    <div class="file-list"></div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="onInputFile"
      multiple>
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，来为{{selection.name}}社区成员生成照片<br />文件名请改成姓名</div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件</div>
    </el-upload>
    <el-dialog title="图片剪裁"
               v-model="dialogVisible"
               width="80%"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               @close="closeDialog">
      <div class="cropper-content" v-if="imageQueue.length > 0">
        <div class="cropper" style="text-align:center">
          <vueCropper
            ref="cropper"
            :img="imageQueue[0].b64"
            outputType="png"
            :info="true"
            :canMove="true"
            :canMoveBox="true"
            :original="false"
            :autoCrop="true"
            :fixed="true"
            :fixedNumber="cropRatio"
            :centerBox="false"
            :infoTrue="false"
            :mode="'cover'"
          ></vueCropper>
          <div class="rotate-buttons">
            <el-button :icon="RefreshLeft" @click="rotateLeft">左转90度</el-button>
            <el-button :icon="RefreshRight" @click="rotateRight">右转90度</el-button>
          </div>
          <div class="userInfo">
            <div class="username">用户名：</div>
            <el-input v-model="imageQueue[0].name"></el-input>
            <div class="username">社区：<strong>{{selection.name}}</strong></div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="finish">确认</el-button>
      </template>
    </el-dialog>
    <Preview :imgList="imgList" @del="del" />
  </div>
</template>

<script setup lang="ts">
import Social from "../components/Social.vue";
import {SocialItem} from "./type";
import {ElUpload, ElDialog, ElButton, ElInput} from "element-plus";
import {ref, shallowRef} from "vue";
import 'vue-cropper/dist/index.css'
import { VueCropper }  from "vue-cropper";
import {makeUserSnap} from "../lib/makeUserSnap";
import Preview from './Preview.vue';
import {sizes} from "../lib/config";
import {RefreshLeft, RefreshRight} from "@element-plus/icons-vue";

const selection = ref({img: '', name: ''})
const cropper = shallowRef();
const imgList = ref<({src: string, name: string, social: string})[]>([]);
const imageQueue = ref<Array<{name: string, b64: string}>>([]);
const dialogVisible = ref(false);
const cropRatio = [sizes.picWidth / sizes.picWidth, sizes.picHeight / sizes.picHeight];

const onSelect = (data: SocialItem) => {
  selection.value = {img: data.img, name: data.name};
}
const onInputFile = ({raw}: {raw: File}) => {
  if (raw.type.indexOf('image/') === 0) {
    const blobUrl = URL.createObjectURL(raw);
    imageQueue.value.push({
      name: raw.name.replace(/\.(\w+)$/, ''),
      b64: blobUrl
    })
    dialogVisible.value = true
  }
}
const rotateLeft = () => {
  cropper.value.rotateLeft()
}
const rotateRight = () => {
  cropper.value.rotateRight()
}
const finish = () => {
  cropper.value.getCropBlob(async (data: Blob) => {
    const blobUrl = URL.createObjectURL(data);
    const username = imageQueue.value[0].name;
    const userAvatar = await makeUserSnap(blobUrl, selection.value.name, selection.value.img, username);
    imageQueue.value.shift();
    imgList.value.push({
      src: userAvatar,
      name: username,
      social: selection.value.name
    });
    if (imageQueue.value.length === 0) {
      dialogVisible.value = false;
    }
  })
}
const del = (index: number) => {
  imgList.value.splice(index, 1);
}
const closeDialog = () => {
  imageQueue.value.splice(0, 1);
  if (imageQueue.value.length === 0) {
    dialogVisible.value = false
  }
}
</script>


<style lang="scss">
.cropper-content {
  .cropper {
    width: auto;
    height: 550px;
    padding-bottom: 85px;
  }
  .rotate-buttons {
    margin-top: 10px;
    font-size: 16px;
  }
  .userInfo {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    margin-top: 10px;
    display: flex;
    align-items: center;
    .el-input {
      width: 200px;
      margin-right: 20px;
    }
  }
}

.Drag {
  .el-upload-dragger {
    width: 480px;
  }
}
</style>

