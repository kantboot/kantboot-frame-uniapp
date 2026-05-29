<template>
  <view>
    <view :class="'btn-view body-view ' + status + '-status-body-view'" :style="style">

      <!-- 背景层 -->
      <view class="box-shadow-view" :style="style + (!isOpenBoxShadow ? 'box-shadow:none;' : '')"></view>
      <view class="background-view" :style="style"></view>
      <view :class="'bg-color-view ' + common + '-common-bg-color-view'" :style="style"></view>

      <!-- error 专用红色层（默认透明，通过状态类控制 opacity） -->
      <view class="bg-color-view error-bg-color-view" :style="style"></view>

      <!-- ================= 默认 ================= -->
      <button
          v-if="status === 'none' || status === 'to-none' || status === 'error-to-none'"
          class="btn"
          :style="style"
          :openType="openType"
          :sessionFrom="sessionFrom"
          :disabled="disable"
          @click.stop="btnClick"
          @getuserinfo="getuserinfo"
          @getphonenumber="getphonenumber"
      >
        <view class="btn-center">
          <slot></slot>
        </view>
      </button>

      <!-- ================= loading ================= -->
      <button
          v-if="status === 'loading'"
          class="btn loading-btn"
          :style="style"
          disabled
      >
        <!-- 占位，保持高度 -->
        <view class="btn-center" style="opacity:0;">
          <slot></slot>
        </view>

        <view class="img-in-btn-box">· · ·</view>
      </button>

      <!-- ================= error ================= -->
      <button
          v-if="status === 'error'"
          class="btn error-btn"
          :style="style"
          disabled
      >
        <kt-icon
            v-if="errorIconShow"
            code="remixicon-error-warning-line"
            size="16px"
            color="#FFFFFF"
            class="icon-left"
        />

        <view class="btn-center">
          <text>{{ errorText }}</text>
        </view>
      </button>

      <!-- ================= success ================= -->
      <button
          v-if="status === 'success'"
          class="btn success-btn"
          :style="style"
          disabled
      >
        <view class="btn-center">
          <text>{{ successText }}</text>
        </view>

        <kt-icon
            code="remixicon-check-line"
            size="16px"
            color="#FFFFFF"
            class="icon-right"
        />
      </button>

    </view>
  </view>
</template>

<script>
import kt from '../../index.js';

export default {
  name: "kt-button",
  props: {
    openType: { type: String, default: "" },
    sessionFrom: { type: String, default: "" },
    disable: { type: Boolean, default: false },
    common: { type: String, default: "black" },
    borderRadius: { type: String, default: "60rpx" },
    isOpenBoxShadow: { type: Boolean, default: true }
  },
  data() {
    return {
      kt,
      errorIconShow: true,
      styleJson: {
        borderRadius: "60rpx"
      },
      style: null,
      status: "none",
      errorText: "",
      successText: "",
      loadingText: ""
    };
  },
  mounted() {
    this.createStyle();
  },
  methods: {
    btnClick() {
      this.$emit("click");
    },
    getuserinfo(e) {
      this.$emit("getuserinfo", e);
    },
    getphonenumber(e) {
      this.$emit("getphonenumber", e);
    },

    createStyle() {
      this.style = `border-radius:${this.styleJson.borderRadius};`;
    },

    loading(text, time = 30000) {
      this.loadingText = text;
      this.status = "loading";
      if (time > 0) {
        setTimeout(() => {
          if (this.status === "loading") this.status = "to-none";
        }, time);
      }
    },

    toNone(){
      this.status = "none";
    },

    success(text, time = 3000) {
      this.successText = text;
      this.status = "success";
      setTimeout(() => {
        if (this.status === "success") this.status = "to-none";
      }, time);
    },

    error(text = "", time = 3000) {
      // 如果字数大于等于12，则 uni.showToast 显示
      // if (text.length >= 12) {
      //   uni.showToast({
      //     icon: "none",
      //     title: text,
      //   });
      //   return;
      // }

      this.errorText = text;
      this.status = "error";
      setTimeout(() => {
        if (this.status === "error") this.status = "error-to-none";
      }, time);
    }
  },
  watch: {
    borderRadius: {
      immediate: true,
      handler(val) {
        this.styleJson.borderRadius = val;
        this.createStyle();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/* ===================== 层级 ===================== */
.btn-view {
  position: relative;
}

/* ===================== 背景层 ===================== */
.box-shadow-view,
.background-view,
.bg-color-view,
.error-bg-color-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.black-common-bg-color-view { background-color: var(--kt-color-primary-6); }
.red-common-bg-color-view { background-color: var(--kt-color-error-6); }
.yellow-common-bg-color-view { background-color: var(--kt-color-warn-6); }
.blue-common-bg-color-view { background-color: var(--kt-color-primary-4); }

/* ✅ error 红色层：默认透明，靠 status 类控制显示 */
.error-bg-color-view {
  background-color: var(--kt-color-error-6);
  opacity: 0;
  transition: opacity 160ms ease;
}

/* ✅ status=error：红色层显示 */
.error-status-body-view .error-bg-color-view {
  opacity: 1;
}

/* ✅ status=error-to-none：红色层淡出 */
.error-to-none-status-body-view .error-bg-color-view {
  opacity: 0;
}

/* （可选）error 时阴影也带点红，增强“错误感” */
.error-status-body-view .box-shadow-view {
  box-shadow: 0 12rpx 26rpx rgba(255, 59, 48, 0.25);
  transition: box-shadow 160ms ease;
}

/* ===================== 核心按钮 ===================== */
.btn {
  position: relative;
  width: 100%;
  padding: 30rpx 60rpx;   /* ✅ 左右对称 */
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff;
  font-size: 35rpx;
  line-height: 40rpx;
  background-color: transparent;
  border: none;
}

/* slot 真居中 */
.btn-center {
  width: 100%;
  text-align: center;
  white-space: nowrap;
  color: #FFFFFF;
}

/* ===================== 图标 ===================== */
.icon-left {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.icon-right {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

/* ===================== loading ===================== */
.loading-btn .img-in-btn-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32rpx;
  color: #FFFFFF;
}

/* ===================== 🔥 覆盖 disabled 默认样式 ===================== */
.btn[disabled] {
  opacity: 1 !important;
  background-color: transparent !important;
}

.btn::after {
  border: none !important;
}

/* ===================== 交互 ===================== */
.btn:active {
  opacity: 0.85;
}

// 如果窗口大于680
@media (min-width: 680px) {
  .btn{
    height: 50px;
    font-size: 20px;
  }
}

</style>
