<template>
  <el-config-provider :size="'large'" :locale="locale">
    <el-tabs v-model="activeName" type="card" >
      <el-tab-pane label="拖拽照片" name="drag"><Drag /></el-tab-pane>
      <el-tab-pane label="摄像头拍摄" name="camera">camera</el-tab-pane>
      <el-tab-pane label="打印设置" name="config">config</el-tab-pane>
    </el-tabs>
  </el-config-provider>
</template>

<script setup>
import {default as locale} from 'element-plus/lib/locale/lang/zh-cn'
import { ElConfigProvider, ElTabs, ElTabPane } from 'element-plus'
import { ref } from 'vue';
import Drag from "./components/Drag.vue";

const activeName = ref('drag');
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 10px 10px 0;
}
</style>
