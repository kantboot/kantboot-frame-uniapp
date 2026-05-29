<script>
import KtContainer from "../kt-container/kt-container.vue";

const ANIM_MS = 300;

export default {
  name: "kt-popup",
  components: { KtContainer },
  props: {
    bgColor: { type: String, default: "var(--kt-color-bg-1)" },
    width: { type: String, default: "500px" },
    zIndex: { type: Number, default: 2000 },
    round: { type: Boolean, default: false },
    padding: { type: String, default: "10px 20px 10px 20px" },
    maskColor: { type: String, default: "var(--kt-color-bg-6)" },
    closeOnMask: { type: Boolean, default: true },
  },
  data() {
    return {
      visible: false,      // 控制 v-if（DOM 是否存在）
      phase: "closed",     // 'enter' | 'open' | 'leave' | 'closed'
      _timer: null,
      classes: { ktPopupContainer: "kt-popup-container" },
    };
  },
  created() {
    this.$kt.style.modeCreateOn(() => {
      this.classes.ktPopupContainer = this.$kt.style.toggleClass("kt-popup-container");
    });
  },
  beforeUnmount() {
    if (this._timer) clearTimeout(this._timer);
  },
  methods: {
    _clearTimer() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
    },

    open() {
      if (this.visible && (this.phase === "enter" || this.phase === "open")) return;

      this._clearTimer();
      this.visible = true;

      // ✅ DOM 先稳定，再进入动画
      this.$nextTick(() => {
        this.phase = "enter";
        this._timer = setTimeout(() => {
          // ✅ 动画结束进入稳定态（is-open），不要回到基础态 opacity:0
          this.phase = "open";
          this._timer = null;
        }, ANIM_MS);
      });
    },

    close() {
      if (!this.visible || this.phase === "leave" || this.phase === "closed") return;

      this._clearTimer();
      this.phase = "leave";

      this._timer = setTimeout(() => {
        this.visible = false;
        this.phase = "closed";
        this._timer = null;
      }, ANIM_MS);

      this.$emit("onClose");
    },

    onMaskClick() {
      if (!this.closeOnMask) return;
      this.close();
    },
  },
};
</script>

<template>
  <kt-container
      ref="ktContainer"
      :class="classes.ktPopupContainer"
      :style="{ '--kt-popup-z-index': zIndex }"
  >
    <!-- 遮罩 -->
    <view
        v-if="visible"
        class="kt-popup-bg"
        :class="{
          'is-enter': phase === 'enter',
          'is-open': phase === 'open',
          'is-leave': phase === 'leave'
        }"
        :style="{ 'background-color': maskColor }"
        @click="onMaskClick"
    ></view>

    <!-- 弹窗 -->
    <view
        v-if="visible"
        class="kt-popup"
        :class="{
          'kt-popup-round': round,
          'is-enter': phase === 'enter',
          'is-open': phase === 'open',
          'is-leave': phase === 'leave'
        }"
        :style="{
          'background-color': bgColor,
          '--kt-popup-width': width,
          padding: padding
        }"
        @click.stop
    >
      <view class="kt-popup-header">
        <slot name="header"></slot>
        <view style="height: 5px"></view>
      </view>

      <view class="kt-popup-content">
        <slot></slot>
      </view>
    </view>
  </kt-container>
</template>

<style lang="scss">
.kt-popup-container {
  --kt-popup-z-index: 2000;
  --kt-popup-anim-ms: 300ms;
  box-sizing: border-box;
}

/* ================= mask ================= */
.kt-popup-bg {
  position: fixed;
  inset: 0;
  z-index: var(--kt-popup-z-index);

  /* ✅ 基础态保持不可见 */
  opacity: 0;
  animation-fill-mode: both;
  will-change: opacity;

  /* 电脑端鼠标手感 */
  // #ifdef H5
  cursor: pointer;
  // #endif
}

.kt-popup-bg.is-enter {
  animation: kt-popup-bg-in var(--kt-popup-anim-ms) ease-in-out both;
}
.kt-popup-bg.is-open {
  /* ✅ 稳定态：常驻，不会闪 */
  opacity: 0.6;
}
.kt-popup-bg.is-leave {
  animation: kt-popup-bg-out var(--kt-popup-anim-ms) ease-in-out both;
}

@keyframes kt-popup-bg-in {
  from { opacity: 0; }
  to { opacity: 0.6; }
}
@keyframes kt-popup-bg-out {
  from { opacity: 0.6; }
  to { opacity: 0; }
}

/* ================= popup base ================= */
.kt-popup {
  position: fixed;
  z-index: calc(var(--kt-popup-z-index) + 1);
  box-sizing: border-box;

  opacity: 0;
  animation-fill-mode: both;
  will-change: transform, opacity;
}

/* 内容滚动（电脑端长内容也不炸） */
.kt-popup-content {
  max-height: 80vh;
  -webkit-overflow-scrolling: touch;
}

/* ================= 💻 电脑端：居中 ================= */
@media (min-width: 769px) {
  .kt-popup {
    left: 50%;
    top: 50%;
    width: var(--kt-popup-width, 500px);
    max-width: 92vw;
    border-radius: 12px;

    // #ifdef H5
    box-shadow: 0 18px 60px rgba(0,0,0,.22);
    // #endif

    transform: translate(-50%, -60%);
  }

  .kt-popup-round {
    border-radius: 16px;
  }

  .kt-popup.is-enter {
    animation: kt-popup-center-in var(--kt-popup-anim-ms) ease-in-out both;
  }

  .kt-popup.is-open {
    opacity: 1;
    transform: translate(-50%, -50%);
  }

  .kt-popup.is-leave {
    animation: kt-popup-center-out var(--kt-popup-anim-ms) ease-in-out both;
  }

  @keyframes kt-popup-center-in {
    from { opacity: 0; transform: translate(-50%, -60%); }
    to   { opacity: 1; transform: translate(-50%, -50%); }
  }

  @keyframes kt-popup-center-out {
    from { opacity: 1; transform: translate(-50%, -50%); }
    to   { opacity: 0; transform: translate(-50%, -60%); }
  }
}

/* ================= 📱 手机端：底部弹窗 ================= */
@media (max-width: 768px) {
  .kt-popup {
    left: 0;
    bottom: 0;
    width: 100%;
    border-radius: 12px 12px 0 0;
    transform: translateY(100%);
  }

  .kt-popup-round {
    border-radius: 20px 20px 0 0;
  }

  .kt-popup.is-enter {
    animation: kt-popup-mobile-in var(--kt-popup-anim-ms) ease-in-out both;
  }

  .kt-popup.is-open {
    opacity: 1;
    transform: translateY(0);
  }

  .kt-popup.is-leave {
    animation: kt-popup-mobile-out var(--kt-popup-anim-ms) ease-in-out both;
  }

  @keyframes kt-popup-mobile-in {
    from { transform: translateY(100%); opacity: 1; }
    to   { transform: translateY(0);   opacity: 1; }
  }
  @keyframes kt-popup-mobile-out {
    from { transform: translateY(0);   opacity: 1; }
    to   { transform: translateY(100%);opacity: 1; }
  }
}
</style>
