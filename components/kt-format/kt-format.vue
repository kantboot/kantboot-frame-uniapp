<script>
import FormatItemText from "./components/kt-format-item-text.vue";
import FormatItemImageId from "./components/kt-format-item-image-id.vue";
import FormatItemImageIds from "./components/kt-format-item-image-ids.vue";
import FormatItemVideoId from "./components/kt-format-item-video-id.vue";
import FormatItem from "./components/kt-format-item.vue";

export default {
  name: "kt-format",
  components: {FormatItem, FormatItemImageIds, FormatItemText,FormatItemImageId,FormatItemVideoId},
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    // data: {
    //   type: Array,
    //   default: () => [{
    //     type: "text",
    //     content: "测试001",
    //   }, {
    //     type: "imageId",
    //     content: "709242540888069",
    //     ratio: "16 / 9",
    //     borderRadius: "20px"
    //   },
    //     {
    //       type: "imageId",
    //       content: "709242540888069",
    //     },
    //     {
    //       type: "imageIds",
    //       content: ["709242540888069", "709242540888069", "709242540888069", "709242540888069"],
    //       cols: 3,
    //       gutter: "10px",
    //     },
    //     {
    //       type: "videoId",
    //       content: "710120902873093",
    //       ratio: "16 / 9"
    //     },
    //     {
    //       type: "videoId",
    //       content: "709967577030661",
    //       ratio: "16 / 9",
    //       fileIdOfCover: "709242540888069"
    //     },
    //     {
    //       type: "videoId",
    //       content: "709967577030661",
    //       ratio: "16 / 9",
    //       fileIdOfCover: "709242540888069",
    //       borderRadius: "10px"
    //     },
    //   ],
    // },
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
    }
  },
  watch: {
  },
  created() {
  },
  methods: {
  },
}
</script>

<template>
  <div
      :class="{
        'kt-format-editable': editable
      }">
    <format-item index="-1"
                    :data="data"
                    v-if="editable"></format-item>
    <div v-for="(item,index) in data">
      <format-item-text
          v-if="item.type === 'text'"
          :item="item"
          :index="index"
          :data="data"
      ></format-item-text>

      <format-item-image-id
        v-else-if="item.type === 'imageId'"
        :item="item"
        :index="index"
        :data="data"
      ></format-item-image-id>

      <format-item-image-ids
      v-else-if="item.type === 'imageIds'"
      :item="item"
      :data="data"
      :index="index"
      ></format-item-image-ids>

      <format-item-video-id
      v-else-if="item.type === 'videoId'"
      :item="item"
      :data="data"
      :index="index"
      ></format-item-video-id>

    </div>

  </div>

</template>

<style>
:root {

}
</style>