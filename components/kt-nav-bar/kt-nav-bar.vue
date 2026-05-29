<template>
  <view
      :id="uuid"
      class="kt-nav-bar"
	  :style="{
		   '--kt-nav-bar-bg-color':bgColor?bgColor:'var(--kt-color-bg-1)',
        'fontWeight':fontWeight,
	  }"
	  >
    <view
    :style="{
      '--kt-nav-bar-status-height': statusBarHeight + 'px',
      '--kt-nav-bar-nav-height': navHeight + 'px',
      '--kt-nav-bar-padding-right': (menuButton.right - menuButton.left + 10) + 'px',
    }"
    >
      <view class="status-bar">
      </view>
      <view class="nav-bar"
      :style="{
        'fontWeight':fontWeight
      }"
      style="position: relative;"
      >

        <kt-icon
            v-if="icon"
            :code="icon" size="calc(var(--kt-nav-bar-title-font-size) * 1.25)"
        :color="iconColor"
        ></kt-icon>

        <kt-icon
            v-show="!icon&!!isHasBack2&isHasBack"
            @click="toBack()"
            class="nav-bar-back-icon"
            code="heroicons-chevron-left-fill"
            :color="iconColor"
            size="16px"></kt-icon>

        <kt-icon
            v-show="!icon&!isHasBack2&isHasBack"
            @click="toHome()"
            class="nav-bar-back-icon"
            code="remixicon-home-line"
            :color="iconColor"
            size="16px"></kt-icon>

        <button
            v-if="!icon&isHasBack"
            @click="toBack()"
        style="position: absolute;left:0;bottom:7px;width: 70px;height: 30px;opacity: 0;z-index:20001;"
        >123</button>


        <view
            :style="{
              color: textColor ? textColor : ktNavTitleColorValue
            }"
            v-if="titleSize==='big'"
            class="nav-bar-title">
          {{ title }}
        </view>
        <view
            :style="{
              color: textColor ? textColor : ktNavTitleColorValue,
              'fontSize':'24rpx',
              'fontWeight':fontWeight
            }"
            v-else-if="titleSize==='normal'"
            class="nav-bar-title">
          {{ title }}
          </view>
        <text style="float: right">
        </text>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  props: {
    titleSize: {
      type: String,
      default: "big"
    },
    title: {
      type: String,
      default: 'TITLE'
    },
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: "#000000"
    },
    textColor: {
      type: String,
      default: null
    },
    isHasBack: {
      type: Boolean,
      default: true
    },
	bgColor:{
	  type: String,
	  default: ""	
	},
 fontWeight:{
   type: String,
   default: "bold"
 },
 filterInvert:{
   type: Boolean,
   default: false
 }
  },
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 48,
      ktNavTitleColorValue: '',
      menuButton: {
        bottom: 0,
        height: 32,
        left: 0,
        right: 0,
        top: 0,
        width: 87
      },
      isHasBack2: true,
      uuid: this.$kt.util.generateUUID()

    };
  },
  created() {
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    this.navHeight = 48;
    // #ifdef MP-WEIXIN
    this.navHeight = uni.getSystemInfoSync().system.indexOf("ios") != -1 ? 44 : 44;
    this.menuButton = wx.getMenuButtonBoundingClientRect();
    // #endif
    // #ifndef MP-WEIXIN
    this.ktNavTitleColorValue = getComputedStyle(document.documentElement).getPropertyValue('--kt-nav-bar-title-color');
    // #endif


    // 判断是否还有上一页
    let pages = getCurrentPages();
    if (pages.length > 1) {
      this.isHasBack2 = true;
    } else {
      this.isHasBack2 = false;
    }
  },
  methods:{
    toBack(){

      if(this.isHasBack2){
        uni.navigateBack({
          delta: 1
        });
      }else{
        this.toHome();
      }
    },
    toHome(){
      // 重新进入小程序
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.kt-nav-bar{
  --kt-nav-bar-bg-color: var(--kt-color-bg-1);
  --kt-nav-bar-title-color: var(--kt-color-text-1);
  --kt-nav-bar-title-font-size: var(--kt-font-size-title-2);
  --kt-nav-bar-status-height: 20px;
  --kt-nav-bar-nav-height: 48px;
  --kt-nav-bar-menu-width: 87px;
  --kt-nav-bar-padding-right: calc(var(--kt-nav-bar-menu-width) + 10px);
  background-color: var(--kt-nav-bar-bg-color);
  color: var(--kt-nav-bar-title-color);
}
.status-bar{
  width: 100%;
  height: var(--kt-nav-bar-status-height);
}
.nav-bar{
  display: inline-block;
  width: calc(100% - var(--kt-nav-bar-padding-right));
  height: var(--kt-nav-bar-nav-height);
  line-height: calc(var(--kt-nav-bar-nav-height) - 4px);
  padding: 0 10px 0 10px;
  box-sizing: border-box;
  position: relative;
  vertical-align: bottom;
  z-index:2000;
  .nav-bar-title{
    position: absolute;
    display: inline-block;
    //font-size: var(--kt-nav-bar-title-font-size);

    color: #000000;
    font-size: 18px;

    margin-left: 8px;
    top:-3px;
  }
}

</style>
