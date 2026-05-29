<template>
  <view class="box">
    <swiper
      class="carousel"
      :indicator-dots="true"
      autoplay
      :circular="true"
      interval="3000"
      duration="500"
      :style="{
        height: height,
      }"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="(item, index) in list" :key="index">
        <view class="carousel-image-box"
              @click="itemClick(item)"
        :style="{
          padding: currentIndex === index ? '0' : '20rpx',
          borderRadius: borderRadius,
        }"
        >
          <image
              class="carousel-image"
              :style="{
                borderRadius: borderRadius
              }"
              style="border-radius: 20px"
              :src="$kt.file.visit(item.fileIdOfImage)"
              mode="aspectFill"
              @click="handleClick(item)"
          />
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import $kt from "../../index";

export default {
  props: {
    typeCode: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '150px'
    },
    borderRadius: {
      type: String,
      default: '10rpx'
    },
  },
  data() {
    return {
      list: [],
      errInfo: {},
      currentIndex: 0,
      $kt,
    };
  },
  watch: {
    typeCode: {
      handler(val, oldVal) {
        if (val === oldVal) {
          return;
        }
        this.getListByTypeCode();
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.getListByTypeCode();
  },
  methods: {
    itemClick(item) {
      this.$emit('itemClick', item);
    },
    getListByTypeCode() {
      this.$kt.request.post("/fp-carousel-web/carousel/getByTypeCode", {
        data: {
          typeCode: this.typeCode
        }
      }).then((res) => {
        this.list = res.data;
        // 按照sort升序排列
        this.list.sort((a, b) => a.sort - b.sort);
      }).catch((err) => {
        this.errInfo = err;
      });
    },
    handleClick(item) {
      if (item.linkUrl) {
        uni.navigateTo({
          url: item.linkUrl
        });
      }
    },
    handleSwiperChange(event) {
      this.currentIndex = event.detail.current; // 更新当前索引
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.carousel {
  width: 100%;
  height: 200px;
}

.carousel-image-box{
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.current-index {
  text-align: center;
  margin-top: 10rpx;
  font-size: 28rpx;
  color: #333;
}
</style>
