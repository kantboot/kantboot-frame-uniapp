<script>
export default {
  name: "kt-format-item",
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Array,
      default: () => [],
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    add(type) {
      let content = null;
      if (type === 'text') {
        content = '';
      } else if (type === 'imageId') {
        content = '';
      } else if (type === 'videoId') {
        content = '';
      }
      if(this.index+""==="-1"){
        // 在开始加
        this.data.unshift({
          type: type,
          content: content,
        });
        this.$emit('update:data', this.data);
        return;
      }

     // TODO 在index位置后添加一个新的{type,content}
      this.data.splice(this.index + 1, 0, {
        type: type,
        content: content,
      });
      this.$emit('update:data', this.data);
    },
    remove() {
      this.data.splice(this.index, 1);
      this.$emit('update:data', this.data);
    },
  },
}
</script>

<template>
<div
    class="kt-format-item"
    :style="{
      '--kt-format-font-size': item.fontSize,
      '--kt-format-border-radius': item.borderRadius,
      '--kt-format-item-row-gutter': item.gutter,
      '--kt-format-item-margin-bottom': item.marginBottom,
      '--kt-format-image-ratio': item.ratio
    }">
  <div class="kt-format-item-slot">
    <slot></slot>
    <div class="kt-format-item-editable-in">
      <kt-button
          @click="add('text')" round
          class="kt-format-item-editable-in-btn"
          type="info"
          size="mini">
        <kt-icon code="remixicon-add-large-fill"></kt-icon>
        {{ $i18n.zhToGlobal('文字') }}
      </kt-button>

      <kt-button
          @click="add('imageId')" round
          class="kt-format-item-editable-in-btn"
          type="info"
          size="mini">
        <kt-icon code="remixicon-add-large-fill"></kt-icon>
        {{ $i18n.zhToGlobal('图片') }}
      </kt-button>

      <kt-button
          @click="remove()" round
          class="kt-format-item-editable-in-btn"
          type="danger"
          size="mini">
        <kt-icon code="remixicon-delete-bin-2-fill"></kt-icon>
        {{ $i18n.zhToGlobal('删除') }}
      </kt-button>

    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.kt-format-item-slot{
  //--kt-format-font-size: var(--kt-font-size-body-3);
  //--kt-format-border-radius: 10px;
  //--kt-format-item-row-gutter: 20;
  //--kt-format-item-margin-bottom: 20px;
  //--kt-format-image-ratio: 1 / 1;

  --kt-format-font-size: var(--kt-font-size-body-3);
  --kt-format-border-radius: none;
  --kt-format-item-row-gutter: 20;
  --kt-format-item-margin-bottom: none;
  --kt-format-image-ratio: none;

  position: relative;
  overflow: hidden;
  font-size: var(--kt-format-font-size);
  border-radius: var(--kt-format-border-radius);
  margin-bottom: var(--kt-format-item-margin-bottom);
}

.kt-format-editable{
  .kt-format-item{
    cursor: pointer;
  }
}
.kt-format-item-view{
  display: block;
}
.kt-format-item-editable{
  display: none;
}

.kt-format-item-editable-in{
  display: none;
  padding: 0 10px 10px 10px;
  text-align: right;
}

.kt-format-editable {
  .kt-format-item-editable-in{
    display: block;
  }
  .kt-format-item-editable{
    display: block;
    padding: 10px;
    box-sizing: border-box;
  }
  .kt-format-item-view{
    display: none;
    opacity: 0;
    user-select: none;
    margin: 0;
  }
}

.kt-format-item-editable-in-btn{
  margin-left: 10px;
}
</style>