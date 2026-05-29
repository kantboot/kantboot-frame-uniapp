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
  data() {
    return {
      editId: this.$kt.util.generateUUID(),
    }
  },
  mounted() {

  },
}
</script>

<template>
  <format-item :item="item">
    <div class="kt-format-item-view">
      <div class="kt-format-item-text-view-pre">{{ item.content }}</div>
    </div>
    <div class="kt-format-item-editable" >
      <input
          type="textarea"
          :id="editId"
        :placeholder="$i18n.zhToGlobal('输入')"
          v-model="item.content"
        class="kt-format-item-text-editable">
      </input>
    </div>
  </format-item>
</template>

<style>
.kt-format-item-text-view-pre{
  width: 100%;
  /* 超出换行 */
  overflow-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  padding: 10px 10px 10px 0;
  box-sizing: border-box;
  color:var(--kt-color-text-1);
  /* 可选中 */
  user-select: text;
}

.kt-format-item-text-editable{
  position: relative;
  width: 100%;
  top:0;
  left:0;
  height: 500px;
  background: rgba(0,0,0,0);
  border: none;
  font-size: var(--kt-format-font-size);
}
</style>