<script>
import FormatItem from "./kt-format-item.vue";

export default {
  name: "kt-format-image-id",
  components: {FormatItem},
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<template>
  <format-item :item="item">
    <div class="kt-format-item-view">
    <image
        :src="$kt.file.visit(item.content)"
        style="width: 100%;display: block"
        :style="{
              aspectRatio: 'var(--kt-format-image-ratio, 1 / 1)',
              borderRadius: 'var(--kt-format-border-radius)',
        }"
        mode="widthFix"
    >
    </image>
    </div>
    <div class="kt-format-item-editable" style="position: relative">
<!--        <kt-upload-image-->
<!--            size="100%"-->
<!--            :ratio="item.ratio || 'var(&#45;&#45;kt-format-image-ratio, 1 / 1)'"-->
<!--            :file-id="item.content"-->
<!--            @uploadSuccess="item.content = $event.id"-->
<!--            @clear="item.content = ''"-->
<!--            class="kt-format-item-image-editable">-->
<!--        </kt-upload-image>-->
    </div>
  </format-item>
</template>

<style>
</style>