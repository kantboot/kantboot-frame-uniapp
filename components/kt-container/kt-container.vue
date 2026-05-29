<script>
export default {
  name: "kt-container",
  data() {
    return {
      width: 0,
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      uuid: this.$kt.util.generateUUID()
    };
  },
  computed: {},
  created() {
  },
  mounted() {
    this.uuid = this.$kt.util.generateUUID();
    setTimeout(()=>{
      this.$kt.style.modeCreateOn(()=>{
        // #ifdef MP
        uni.createSelectorQuery().in(this).select('#' + this.uuid).boundingClientRect(data => {
          if(data && data.width){
            let width = data.width;
            this.width = width;
            this.xs = width < 768;
            this.sm = width >= 768 && width < 992;
            this.md = width >= 992 && width < 1200;
            this.lg = width >= 1200 && width < 1920;
            this.xl = width >= 1920 && width < 2560;
            this.$emit("change", {
              xs: this.xs,
              sm: this.sm,
              md: this.md,
              lg: this.lg,
              xl: this.xl
            });
          }
        }).exec();
        // #endif
        // #ifndef MP
        let width = document.getElementById(this.uuid).clientWidth;
        this.width = width;
        this.xs = width < 768;
        this.sm = width >= 768 && width < 992;
        this.md = width >= 992 && width < 1200;
        this.lg = width >= 1200 && width < 1920;
        this.xl = width >= 1920 && width < 2560;
        this.$emit("change", {
          xs: this.xs,
          sm: this.sm,
          md: this.md,
          lg: this.lg,
          xl: this.xl
        });
        // #endif
      });

    },50);
  },
  methods:{
    isXs() {
      return this.xs;
    },
    isSm() {
      return this.sm;
    },
    isMd() {
      return this.md;
    },
    isLg() {
      return this.lg;
    },
    isXl() {
      return this.xl;
    }
  }
}
</script>

<template>
  <view
      ref="container"
      :id="uuid"
      class="kt-container"
      :class="{
        'kt-container-xs': xs,
        'kt-container-sm': sm,
        'kt-container-md': md,
        'kt-container-lg': lg,
        'kt-container-xl': xl
      }"
      :width-size-xs="xs"
      :width-size-sm="sm"
      :width-size-md="md"
      :width-size-lg="lg"
      :width-size-xl="xl">
    <slot></slot>
  </view>
</template>

<style>
.kt-container {
  position: relative;
  width: 100%;
}
</style>