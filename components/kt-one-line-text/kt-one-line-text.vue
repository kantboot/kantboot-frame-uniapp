<template>
  <view :style="{
    textAlign: textAlign,
    fontSize: fontSize,
    fontWeight:fontWeight,
    letterSpacing: letterSpacing,
    display: 'inline-block',
    width: width,
    color: color,
    // 超出不显示
    overflow: 'hidden',
    padding: '0',
    background: 'rgba(0,0,0,0)',
  }"
  class="box"
  >
    <view
        :id="'text_'+uuid"
        class="text_hide">
      {{ text }}
    </view>
    <view
        v-if="!isCalculated"
        class="text">
      -
    </view>
    <view
        v-if="isCalculated"
        class="text" :style="{width:width+'px'}">
      <view
          v-if="!isOver"
          class="text-normal" :style="{width:width+'px'}">
        {{ text }}
      </view>
      <view
          v-else
          class="text-scroll"
          :class="{
            'text-scroll-is-ar': i18n.getLanguageCode() === 'ar',
            'text-scroll-not-ar': i18n.getLanguageCode() !== 'ar'
          }"
          :style="{
            width:textWidth+'px',
          }">
        {{ text }}
      </view>
    </view>

  </view>
</template>

<script>
import util from "../../libs/util";
import i18n from "../../libs/i18n";

export default {
  props: {
    width: {
      type: String,
      default: '90px'
    },
    text: {
      type: String,
      default: '测试123测试打多久啊卡里的就阿里的急啊离开独家卡了'
    },
    fontSize: {
      type: String,
      default: '16px'
    },
	fontWeight:{
      type: String,
      default: 'normal'
	},
  textAlign:{
      type: String,
      default: 'center'
    },
    // 间距
    letterSpacing: {
      type: String,
      default: '0px'
    },
    color:{
      type: String,
      default: '#000000'
    }
  },
  data() {
    return {
      uuid: util.generateUUID(),
      textWidth: 0,
      // 是否超出
      isOver: false,
      // 是否计算完成
      isCalculated: false,
      i18n
    };
  },
  watch: {
    text(newVal, oldVal) {
      this.getTextWidth();
    },
    width(newVal, oldVal) {
      this.getTextWidth();
    }
  },
  mounted() {
    this.getTextWidth();

  },
  methods: {
    // 获取width的px值
    getWidthPx() {
      // 如果末尾是rpx
      if (this.width.endsWith('rpx')) {
        let num = this.width.replace('rpx', '');
        return util.rpxToPx(num);
      }
      // 如果末尾是px
      if (this.width.endsWith('px')) {
        return this.width.replace('px', '');
      }
    },
    // 获取文本宽度
    getTextWidth() {
      uni.createSelectorQuery().in(this).select('#text_' + this.uuid).boundingClientRect((data) => {
        console.log("文本宽度", data.width);
        this.textWidth = data.width;
        this.isOver = this.textWidth > this.getWidthPx();
        setTimeout(()=>{
          this.isCalculated = true;
        },10);
        return data.width;
      }).exec();
	  setTimeout(()=>{
      uni.createSelectorQuery().in(this).select('#text_' + this.uuid).boundingClientRect((data) => {
        console.log("文本宽度", data.width);
        this.textWidth = data.width;
        this.isOver = this.textWidth > this.getWidthPx();
        setTimeout(()=>{
          this.isCalculated = true;
        },10);
        return data.width;
      }).exec();
	  },100);
    }
  },
}
</script>

<style lang="scss" scoped>
.box{
  // 超出不显示
  overflow: hidden;
  // 不换行
  white-space: nowrap;
  // 一行
  text-overflow: ellipsis;
}

.text_hide {
  position: absolute;
  display: inline-block;
  z-index: -1;
  opacity: 0;
  // 不换行
  white-space: nowrap;
}

.text-normal {
  display: inline-block;
}

.text-scroll {
  // 不换行
  white-space: nowrap;
  width: 100%;
}

.text-scroll-not-ar {
  //animation: scroll 5s linear infinite;
  // 每次都是从100%开始
  animation: scroll 5s linear infinite;
}

.text-scroll-is-ar {
  animation: scrollAr 5s linear infinite;
}

@keyframes scroll {
  0%{
    transform: translateX(40%);
    opacity: .2;
  }
  10% {
    transform: translateX(20%);
    opacity: 1;
  }
  50% {
    transform: translateX(-20%);
    opacity: 1;
  }
  100% {
    transform: translateX(-70%);
    opacity: .4;
  }
}

// 阿拉伯语, 从右到左
@keyframes scrollAr {
  0% {
    transform: translateX(-80%);
  }
  100% {
    transform: translateX(50%);
  }
}

.text{
  // 超出不显示
  overflow: hidden;
}

</style>
