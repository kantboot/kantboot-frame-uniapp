<script>
export default {
  name: "KtIcon",
  props: {
    /**
     * 编码
     */
    code: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },

    content: {
      type: String,
      default: null,
    },

    /**
     * 按钮大小
     * 可选值：'large', 'medium', 'small', 'mini'
     */
    size: {
      type: String,
      default: "small",
    },
    /**
     * 按钮类型
     * 可选值：'primary', 'success', 'warning', 'danger', 'info'
     */
    type: {
      type: String,
      default: null,
    },
    /**
     * 线宽
     */
    strokeWidth: {
      type: Number,
      default: .1,
    }
  },
  data() {
    return {
      classes: {
        ktIcon: "kt-icon",
      },
      svgHtml: null,
      isShow: true,
      showNumber: 0,
    };
  },
  created() {
    if (!this.code) {
      return;
    }
    // #ifndef MP
    this.$request.get("/functional-icon-web/icon/getByCode?code="+this.code, {
    }).then((res) => {
      this.svgHtml = res.data.content;
    }).catch((err) => {
      console.error("获取SVG图标失败:", err);
    });
    // #endif

  },
  methods: {
    getVisitUrl(){
      if(this.color){
        return this.$request.config.rootAddress + '/functional-icon-web/icon/visitByCode?code='+this.code
            +'&color='+encodeURIComponent(this.color)
            +"&strokeWidth="+encodeURIComponent(this.strokeWidth)
            ;
      }
      return this.$request.config.rootAddress + '/functional-icon-web/icon/visitByCode?code='+this.code
      +"&strokeWidth="+encodeURIComponent(this.strokeWidth)
    },
    /**
     * 获取图标的类名
     * @returns {string}
     */
    getIconClass() {
      let iconClasses = ["kt-icon"];
      if (this.size) {
        iconClasses.push(`kt-icon--size-${this.size}`);
      }
      if (this.type) {
        iconClasses.push(`kt-icon--type-${this.type}`);
      }
      return iconClasses.join(" ");
    },
    /**
     * 是否是可选的大小选项
     */
    isOptionalSize(size) {
      return ["large", "medium", "small", "mini"].includes(size);
    },
    /**
     * 获取图标的大小
     */
    getIconSizeNumStr() {
      // 正则表达式，如果全是数字
      const sizeNum = parseFloat(this.size);
      if (!isNaN(sizeNum)) {
        return sizeNum.toString() + "px";
      }
      return this.size;
    },
  },
}
</script>

<template>
  <view
      :style="{
    display: 'inline-block',
    width: getIconSizeNumStr(),
    height: getIconSizeNumStr(),
  }"
  >
    <!-- #ifndef MP -->
    <svg viewBox="0 0 24 24"
         fill="currentColor"
         xmlns="http://www.w3.org/2000/svg"
         stroke="currentColor"
         :stroke-width="strokeWidth"
         :class="classes.ktIcon"
         v-html="svgHtml || content"
    >
    </svg>
    <!-- #endif -->
    <!-- #ifdef MP -->
    <image
        v-if="isShow"
        :src="getVisitUrl()"
        :style="{
          width: '100%',
          height: '100%',

        }"
    ></image>
    <!-- #endif -->
  </view>
</template>

<style>
.kt-icon {
  width: 100%;
  height: 100%;
}

.kt-icon--size-large {
  width: 2em;
  height: 2em;
}

.kt-icon--size-medium {
  width: 1.5em;
  height: 1.5em;
}

.kt-icon--size-small {
  width: 1em;
  height: 1em;
}

.kt-icon--size-mini {
  width: 0.75em;
  height: 0.75em;
}

</style>