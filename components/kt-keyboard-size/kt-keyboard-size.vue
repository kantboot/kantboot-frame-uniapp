<template>
  <view>
    <view
        class="m-big-box"
        v-if="keyboardHeight>0"
        :style="'height:'+keyboardHeight+'px'">
<!--      <image-->
<!--          class="keyboard"-->
<!--          :src="$kt.file.byPath('kantboot/icon/keyboard.svg')"></image>-->
      <kt-icon code="remixicon-keyboard-box-fill"
      class="keyboard"
               size="30px"
               color="#999999"
      ></kt-icon>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyboardHeight: 0
    };
  },
  created() {
    this.$kt.event.on('keyboardHeightChange', (height) => {
      if (height === 0) {
        this.setKeyboardHeight(0);
        return;
      }
      this.setKeyboardHeight(height);
    });
  },
  mounted() {
    uni.onKeyboardHeightChange((res) => {
      this.$kt.event.emit('keyboardHeightChange', res.height);
      if (res.height === 0) {
        this.$emit('hide');
        return;
      }
      this.$emit('show');
    });
  },
  methods: {
    setKeyboardHeight(height) {
      this.keyboardHeight = height;
    },
    getHeight(){
      return this.keyboardHeight;
    }

  },
  watch: {
    keyboardHeight(val){
      if(val>0){
        this.$emit('show');
      }else{
        this.$emit('hide');
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.m-big-box{
  position: relative;
  .keyboard{
    position: absolute;
    width: 70rpx;
    height: 70rpx;
    top:50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
}
</style>
