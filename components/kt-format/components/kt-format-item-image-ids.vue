<script>
import FormatItem from "./kt-format-item.vue";

export default {
  name: "kt-format-item-image-ids",
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {FormatItem},
  methods:{
    getSpan(item) {
      if (!item.cols || item.cols <= 0) {
        item.cols = 1;
      }
      if (item.content && item.content.length < item.cols) {
        item.cols = item.content.length;
      }
      return 1 / item.cols;
    },
  }
}
</script>

<template>
<format-item>
  <row :cols="1" :gutter="item.gutter">
    <col :span="getSpan(item)" v-for="(image, index) in item.content" :key="index">
      <div style="width: 100%">
        <image
            :src="$kt.file.visit(image)"
            style="width: 100%;"
            :style="{
                    aspectRatio: item.ratio || '1 / 1',
                    borderRadius: item.borderRadius || 'var(--kt-format-border-radius)',
                  }"
            mode="widthFix"
        >
        </image>
      </div>
    </col>
  </row>
</format-item>
</template>

<style scoped>

</style>