<template>
  <div class="Preview">
    <h3 v-if="imgList.length > 0">
      预览
      <el-button size="default" type="primary" @click="openAll">打开贴纸PDF</el-button>
    </h3>
    <div class="preview">
      <div class="preview-item" v-for="(item, index) in imgList" :style="{backgroundImage: `url(${item.src})`}">
        <div class="hover">
          <el-button type="primary" :style="{marginBottom: '15px'}" @click="openPDF(item)">打开贴纸PDF</el-button>
          <el-button type="danger" @click="del(index)">删除</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits} from "vue";
import {ElButton} from "element-plus";

type ImageItem = {
  src: string, name: string, social: string
}
const {imgList} = defineProps<{
  imgList: ImageItem[]
}>()
const emit = defineEmits(['del'])

const openPDF = (src: ImageItem) => {
  const fileName = `${src.name}-${src.social}`;
  // ipcRenderer.send('makePDF', {name: fileName, imgList: [src]});
}
const openAll = () => {
  const fileName = `${imgList[0].social}-${imgList[0].name}等${imgList.length}人`;
  // ipcRenderer.send('makePDF', {name: fileName, imgList: this.imgList});
}
const del = (index: number) => {
  emit('del', index);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.Preview {
  h3 {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .preview {
    padding: 0px 0 10px;
    display: flex;
    flex-wrap: wrap;
    .preview-item {
      width: 180px;
      height: 180px;
      background-size: contain;
      display: block;
      box-shadow: 0 0 7px #e6e6e6;
      border-radius: 12px;
      margin-right: 15px;
      margin-bottom: 15px;
      position: relative;
      overflow: hidden;
      .hover {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        background-color: rgba(0, 0, 0, .6);
        width: 100%;
        height: 100%;
        transition: opacity 300ms ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      &:hover {
        .hover {
          opacity: 1;
        }
      }

    }
  }
}
</style>
