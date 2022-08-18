<template>
  <div class="Social">
    <h3>请选择社区</h3>
    <div class="socials">
      <template v-for="(item, index) in socialList">
        <div :class="['social-item', {active: selectIndex === index}]"
             @click="select(index)"
             v-if="limit? index < 10 : true"
             :style="{backgroundImage: `url(${item.img})`}">
          <div class="social-name">{{item.name}}</div>
        </div>
      </template>
      <div class="more" v-if="limit" @click="showAll">查看全部</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, defineEmits, onMounted} from 'vue';
import png01 from '../assets/social/01.png';
import png02 from '../assets/social/02.png';
import png03 from '../assets/social/03.png';
import png04 from '../assets/social/04.png';
import png05 from '../assets/social/05.png';
import png06 from '../assets/social/06.png';
import png07 from '../assets/social/07.png';
import png08 from '../assets/social/08.png';
import png09 from '../assets/social/09.png';
import png10 from '../assets/social/10.png';
import png11 from '../assets/social/11.png';
import png12 from '../assets/social/12.png';
import png13 from '../assets/social/13.png';
import png14 from '../assets/social/14.png';
import png15 from '../assets/social/15.png';
import pnglg from '../assets/social/lg.png';
import {SocialItem} from "./type";

const limit = ref(true);
const selectIndex = ref(0);
const emit = defineEmits(['select']);
const socialList: SocialItem[] = [
  {img: png01, name: '碧湖'},
  {img: png02, name: '玫瑰'},
  {img: png03, name: '月光'},
  {img: png05, name: '晚霞'},
  {img: png06, name: '绿野'},
  {img: png07, name: '山丘'},
  {img: png08, name: '河畔'},
  {img: png09, name: '首街'},
  {img: png10, name: '沙湾'},
  {img: png11, name: '中式'},
  {img: png12, name: '白浪'},
  {img: png13, name: '羊田'},
  {img: png14, name: '长松'},
  {img: png15, name: '南畔'},
  {img: png04, name: '中央'},
  {img: pnglg, name: '义工'}
]

const showAll = () => {
  limit.value = false;
}

const select = (index: number) => {
  selectIndex.value = index;
  const item = socialList[index];
  if (item.name === '义工') {
    emit('select', {
      img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=',
      name: ''
    });
  }
  else {
    emit('select', item);
  }
}

onMounted(() => {
  select(selectIndex.value);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.Social {
  margin-bottom: 20px;
  .socials {
    display: flex;
    flex-wrap: wrap;
    .social-item {
      width: 80px;
      height: 80px;
      background-size: 64px 64px;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 7px;
      cursor: pointer;
      padding: 2px;
      &:hover {
        background-color: lighten(#42b983, 30%);
      }
      &.active {
        background-color: #42b983;
        cursor: initial;
      }
      .social-name {
        font-weight: bold;
        font-size: 14px;
      }
    }
    .more {
      width: 80px;
      height: 80px;
      border-radius: 7px;
      &:hover {
        background-color: lighten(#42b983, 30%);
      }
      color: #42b983;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
}
</style>
