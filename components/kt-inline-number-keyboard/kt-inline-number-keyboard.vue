<template>
  <view class="kb">
    <view class="kb-grid">
      <!-- 1-9 -->
      <view
        v-for="n in 9"
        :key="n"
        class="kb-key"
        @click="press(String(n))"
      >
        {{ n }}
      </view>

      <!-- 左下：小数点/清空 -->
      <view
        class="kb-key"
        :class="{ 'kb-key--disabled': !decimal }"
        @click="decimal ? press('.') : null"
      >
        {{ decimal ? '.' : '' }}
      </view>

      <!-- 0 -->
      <view class="kb-key" @click="press('0')">0</view>

      <!-- 删除（长按连续删） -->
      <view
        class="kb-key kb-key--action"
        @click="backspace"
      >
        ⌫
      </view>
    </view>

    <view class="kb-actions">
      <button class="kb-btn kb-btn--ghost" v-if="showClear" @click="clear">
        清空
      </button>

      <button class="kb-btn kb-btn--primary" @click="confirm">
        {{ confirmText }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: "KtInlineNumberKeyboard",
  props: {
    // v-model
    value: { type: [String, Number], default: "" },

    // 行为
    decimal: { type: Boolean, default: true },      // 是否允许小数点
    showClear: { type: Boolean, default: true },    // 显示清空按钮
    confirmText: { type: String, default: "提现" },

    // 规则
    maxIntegerDigits: { type: Number, default: 9 },
    maxDecimalDigits: { type: Number, default: 2 },
    max: { type: Number, default: Infinity },
    min: { type: Number, default: -Infinity },
    allowLeadingZero: { type: Boolean, default: false },
    allowEmpty: { type: Boolean, default: true },
    autoFixOnConfirm: { type: Boolean, default: true },
  },
  data() {
    return {
      inner: "",
      holdTimer: null,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(v) {
        this.inner = v === null || v === undefined ? "" : String(v);
      },
    },
  },
  methods: {
    emitInput() {
      this.$emit("input", this.inner);
      this.$emit("change", this.inner);
    },

    normalize() {
      if (this.inner === ".") this.inner = "0.";
      if (!this.allowLeadingZero) {
        // 处理 "00" -> "0"
        if (/^0\d+/.test(this.inner) && !this.inner.includes(".")) {
          this.inner = String(parseInt(this.inner, 10));
        }
        // 处理 "00.1" -> "0.1"
        if (/^0\d+\./.test(this.inner)) {
          const parts = this.inner.split(".");
          this.inner = "0." + (parts[1] || "");
        }
      }
    },

    press(ch) {
	  this.$emit("pressOne",ch);
      
	  // 小数点
      if (ch === ".") {
        if (!this.decimal) return;
        if (this.inner.includes(".")) return;
        if (this.inner === "") {
          this.inner = "0.";
          this.emitInput();
          return;
        }
        this.inner += ".";
        this.emitInput();
        return;
      }

      // 数字
      if (!/^\d$/.test(ch)) return;

      if (!this.allowLeadingZero) {
        if (this.inner === "0" && ch === "0" && !this.inner.includes(".")) return;
        if (this.inner === "0" && ch !== "0" && !this.inner.includes(".")) {
          this.inner = ch;
          this.emitInput();
          return;
        }
      }

      // 位数限制
      const [intPart, decPart = ""] = this.inner.split(".");
      if (!this.inner.includes(".")) {
        if (intPart.length >= this.maxIntegerDigits) return;
      } else {
        if (decPart.length >= this.maxDecimalDigits) return;
      }

      this.inner += ch;
      this.normalize();
      this.emitInput();
    },

    backspace() {
      this.$emit("backspaceOne");
      if (!this.inner) return;
      this.inner = this.inner.slice(0, -1);
      this.emitInput();
    },

    startHoldDelete() {
      this.stopHoldDelete();
      this.backspace();
      this.holdTimer = setInterval(() => this.backspace(), 120);
    },

    stopHoldDelete() {
      if (this.holdTimer) {
        clearInterval(this.holdTimer);
        this.holdTimer = null;
      }
    },

    clear() {
      this.$emit("clearAll");

      if (!this.allowEmpty) return;
      this.inner = "";
      this.emitInput();
      this.$emit("clear");
    },

    clampToRange() {
      if (this.inner === "" || this.inner === "." || this.inner === "-") return;
      const n = Number(this.inner);
      if (Number.isNaN(n)) return;

      let x = n;
      if (x > this.max) x = this.max;
      if (x < this.min) x = this.min;

      if (this.decimal) x = Number(x.toFixed(this.maxDecimalDigits));
      else x = Math.trunc(x);

      this.inner = String(x);
      this.emitInput();
    },

    confirm() {
      this.$emit("confirmOne");

      if (this.autoFixOnConfirm) this.clampToRange();
      this.$emit("confirm", this.inner);
    },
  },
  beforeDestroy() {
    this.stopHoldDelete();
  },
};
</script>

<style scoped lang="scss">
.kb {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.kb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.kb-key {
  height: 96rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 700;
  color: #111;
  user-select: none;
}

.kb-key:active {
  opacity: 0.82;
}

.kb-key--action {
  background: #ececec;
}

.kb-key--disabled {
  background: #fafafa;
  color: #bbb;
}

.kb-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 18rpx;
}

.kb-btn {
  flex: 1;
  height: 90rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 90rpx;
}

.kb-btn--ghost {
  background: #fff;
  border: 1rpx solid #ddd;
  color: #333;
}

.kb-btn--primary {
  background: #046B50;
  color: #fff;
  border: none;
}
</style>
