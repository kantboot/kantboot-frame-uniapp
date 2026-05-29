<script>
import FormatItem from "./kt-format-item.vue";

export default {
  name: "kt-format-text",
  components: {FormatItem},
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  data(){
    return {
      id: this.$kt.util.generateUUID(),
      // 是否正在播放
      isPlaying: false,
      // 是否有播放进度
      hasProgress: false,
    }
  },
  mounted() {
    // 监听视频播放事件
    const video = document.getElementById(this.id);
    if(video){
      video.addEventListener('play', () => {
        this.isPlaying = true;
      });
      video.addEventListener('pause', () => {
        this.isPlaying = false;
      });
      video.addEventListener('ended', () => {
        this.isPlaying = false;
      });
      // 获取进度
      video.addEventListener('timeupdate', () => {
        console.log(video.currentTime);
        // 获取是否播放进度大于1秒
        if(video.currentTime > 1){
          this.hasProgress = true;
        } else {
          this.hasProgress = false;
        }
      });
    }
  },
  methods:{
    play(){
      const video = document.getElementById(this.id);
      if(video&& !this.isPlaying){
        video.play();
      }
      if(video && this.isPlaying){
        video.pause();
      }
    }
  }
}
</script>

<template>
  <format-item :item="item">
    <video
        :id="id"
        :src="$kt.file.visit(item.content)"
        class="kt-format-video"
        :controls="hasProgress"
        :style="{
           aspectRatio: item.ratio || '16 / 9',
           borderRadius: item.borderRadius || 'var(--kt-format-border-radius)',
        }">
    </video>
<!--    <kt-image-->
<!--        v-if="item.fileIdOfCover"-->
<!--        v-show="!isPlaying && !hasProgress"-->
<!--        :src="$kt.file.visit(item.fileIdOfCover)"-->
<!--        style="width: 100%;height: 100%;position: absolute;top: 0;left: 0;z-index:1"-->
<!--        :style="{-->
<!--          aspectRatio: item.ratio || '16 / 9',-->
<!--          borderRadius: item.borderRadius || '0px',-->
<!--        }"-->
<!--        fit="cover"-->
<!--    ></kt-image>-->
    <div
        v-if="!hasProgress"
        @click="play()"
        class="kt-format-video-controls-box">
      <div
          class="kt-format-video-controls-box-bg"></div>
      <div class="kt-format-video-controls">
        <kt-icon
            v-if="!isPlaying"
            class="kt-format-video-controls-play"
            code="heroicons-play-circle-line"></kt-icon>
      </div>
    </div>
  </format-item>
</template>

<style lang="scss">
.kt-format-video {
  width: 100%;
  /* 隐藏所有控件 */
  outline: none;
  z-index: 1;
}

.kt-format-video-controls-box {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  .kt-format-video-controls-box-bg{
    display: none;
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    opacity: .3;
    /* 斑马条纹 */
    background: repeating-linear-gradient(45deg,
        var(--kt-color-bg-1),
        var(--kt-color-bg-1) 10px,
        var(--kt-color-bg-2) 10px,
        var(--kt-color-bg-2) 20px);
  }
  .kt-format-video-controls{
    display: none;
    position: absolute;
    z-index: 3;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    .kt-format-video-controls-play{
      position: absolute;
      z-index: 4;
      left: 50%;
      top: 50%;
      font-size: var(--kt-size-20);
      transform: translate(-50%, -50%);
      opacity: .5;
    }
    .kt-format-video-controls-play:hover{
      opacity: .8;
      transform: translate(-50%, -50%) scale(1.1);
    }
    .kt-format-video-controls-play:active{
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

.kt-format-video-controls-box:hover{
  cursor: pointer;
  .kt-format-video-controls-box-bg{
    display: block;
  }
  .kt-format-video-controls{
    display: block;
    .kt-format-video-controls-play{
      animation: kt-format-video-controls-play-out-hover .5s ease-in-out;
    }
  }
}


@keyframes kt-format-video-controls-play-out-hover {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) rotate(360deg)  scale(.5);
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
}

</style>