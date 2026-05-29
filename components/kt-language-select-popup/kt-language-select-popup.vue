<script>
/**
 * 目标：不突兀的进出场
 * - 遮罩先轻轻淡入，再面板“缓慢滑入 + 轻微缩放”
 * - 关闭：面板先“缓慢滑出 + 轻微缩小”，再遮罩淡出
 *
 * ✅ 仅改动：背景遮罩 tg-mask 变成 iOS 玻璃效果（渐进 blur）
 * ✅ 其它（面板样式/颜色/结构）保持你原来的不动
 * ✅ 兼容 sass：对 saturate/brightness 使用 unquote，避免被 sass 当成函数解析
 */
const MASK_DELAY_MS = 120;
const ENTER_MS = 360;
const LEAVE_MS = 260;
const MASK_OUT_MS = 220;

export default {
  name: "kt-language-select-popup",
  props: {
    autoOpen: { type: Boolean, default: false },
    closeOnMask: { type: Boolean, default: true },
    pcWidth: { type: String, default: "520px" },
  },
  data() {
    return {
      visible: false,
      phase: "closed", // enter-mask | enter-panel | leave-panel | leave-mask | closed

      list: [],
      loading: false,
      error: "",
      keyword: "",

      _t1: null,
      _t2: null,
      _t3: null,
    };
  },
  computed: {
    selectedCode() {
      return this.$i18n.getLanguageCode();
    },
    filteredList() {
      const kw = (this.keyword || "").trim().toLowerCase();
      if (!kw) return this.list || [];
      return (this.list || []).filter((it) => {
        const name = (it?.name || "").toLowerCase();
        const code = (it?.code || "").toLowerCase();
        return name.includes(kw) || code.includes(kw);
      });
    },
  },
  methods: {
    open() {
      if (this._t1) clearTimeout(this._t1);
      if (this._t2) clearTimeout(this._t2);
      if (this._t3) clearTimeout(this._t3);

      // 如果已经打开/正在打开，直接确保在 enter-panel
      if (this.visible && (this.phase === "enter-panel" || this.phase === "open")) {
        this.phase = "enter-panel";
        return;
      }

      this.visible = true;

      // 1) 先淡入遮罩
      this.phase = "enter-mask";

      // 2) 再让面板缓慢滑入
      this.$nextTick(() => {
        this._t1 = setTimeout(() => {
          this.phase = "enter-panel";
        }, MASK_DELAY_MS);
      });

      // 3) 自动归一到 open（可选，仅用于语义）
      this._t2 = setTimeout(() => {
        if (this.visible) this.phase = "open";
      }, MASK_DELAY_MS + ENTER_MS + 40);
    },

    close(done) {
      if (!this.visible) return;
      if (this._t1) clearTimeout(this._t1);
      if (this._t2) clearTimeout(this._t2);
      if (this._t3) clearTimeout(this._t3);

      // 1) 先让面板走（慢一点、柔一点）
      this.phase = "leave-panel";

      this._t1 = setTimeout(() => {
        // 2) 再让遮罩淡出
        this.phase = "leave-mask";

        this._t3 = setTimeout(() => {
          this.visible = false;
          this.phase = "closed";
          done && done();
        }, MASK_OUT_MS);
      }, LEAVE_MS);
    },

    onMaskClick() {
      if (this.closeOnMask) this.close();
    },

    async getBySupport() {
      this.loading = true;
      this.error = "";
      try {
        const res = await this.$request.get("/system-language-web/language/getBySupport");
        this.list = res?.data || [];
      } catch (e) {
        this.error = this.$i18n.zhToGlobal("加载失败，请稍后重试");
        this.list = [];
      } finally {
        this.loading = false;
      }
    },

    onSelect(item) {
      this.$i18n.setLanguageCode(item.code);
      window.location.reload();

    },

    clearKeyword() {
      this.keyword = "";
    },
  },
  async mounted() {
    await this.getBySupport();
    if (this.autoOpen) this.open();
  },
  beforeDestroy() {
    if (this._t1) clearTimeout(this._t1);
    if (this._t2) clearTimeout(this._t2);
    if (this._t3) clearTimeout(this._t3);
  },
};
</script>

<template>
  <view v-if="visible" class="tg-root" :class="'phase-' + phase">
    <!-- mask -->
    <view class="tg-mask" @click="onMaskClick"></view>

    <!-- panel -->
    <view class="tg-panel" :style="'--pc-width:' + pcWidth">
      <!-- header -->
      <view class="tg-head">
        <view class="tg-head-left">
          <view class="tg-head-icon">
            <kt-icon code="heroicons-language-line" />
          </view>
          <view class="tg-head-text">
            <text class="tg-title">{{ $i18n.zhToGlobal("语言选择") }}</text>
            <text class="tg-subtitle">{{ $i18n.zhToGlobal("选择你要显示的语言") }}</text>
          </view>
        </view>
      </view>

      <!-- search -->
      <view class="tg-search-wrap">
        <view class="tg-search">
          <view class="tg-search-icon">
            <kt-icon code="heroicons-magnifying-glass-line" />
          </view>

          <input
              class="tg-search-input"
              v-model="keyword"
              :placeholder="$i18n.zhToGlobal('搜索语言或代码')"
              placeholder-class="tg-search-placeholder"
              confirm-type="search"
          />

          <view v-if="keyword" class="tg-search-clear" @click.stop="clearKeyword()">
            <kt-icon code="heroicons-x-mark-line" />
          </view>
        </view>
      </view>

      <!-- body -->
      <view class="tg-body">
        <view v-if="loading || error" class="tg-state">
          <text v-if="loading" class="tg-state-text">{{ $i18n.zhToGlobal("正在加载语言列表") }}…</text>
          <text v-else class="tg-state-error">{{ error }}</text>
        </view>

        <!-- group -->
        <view v-if="!loading && !error && filteredList.length > 0" class="tg-group">
          <view
              v-for="item in filteredList"
              :key="item.id"
              class="tg-row"
              :class="{ 'is-active': item.code === selectedCode }"
              @click="onSelect(item)"
              hover-class="tg-row-hover"
          >
            <view class="tg-row-main">
              <text class="tg-row-title">{{ item.name }}</text>
              <text class="tg-row-sub">{{ item.code }}</text>
            </view>

            <view class="tg-row-right">
              <view v-if="item.code === selectedCode" class="tg-check">
                <kt-icon code="heroicons-check-line" />
              </view>
              <view v-else class="tg-chevron">
                <kt-icon code="heroicons-chevron-right-line" />
              </view>
            </view>
          </view>
        </view>

        <!-- empty (filtered) -->
        <view v-if="!loading && !error && list.length > 0 && filteredList.length === 0" class="tg-empty">
          <text class="tg-empty-title">{{ $i18n.zhToGlobal("没有匹配的语言") }}</text>
          <text class="tg-empty-desc">{{ $i18n.zhToGlobal("换个关键词试试") }}</text>
        </view>

        <!-- empty (no data) -->
        <view v-if="!loading && !error && list.length === 0" class="tg-empty">
          <text class="tg-empty-title">{{ $i18n.zhToGlobal("暂无可用语言") }}</text>
          <text class="tg-empty-desc">{{ $i18n.zhToGlobal("请稍后重试或检查后端配置") }}</text>
        </view>
      </view>

      <!-- bottom safe spacing -->
      <view class="tg-foot"></view>
    </view>
  </view>
</template>

<style scoped lang="scss">
/* ====== motion tokens ====== */
.tg-root {
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --ease-in: cubic-bezier(.3, 0, .2, 1);
  --mask-in-ms: 260ms;
  --mask-out-ms: 220ms;
  --enter-ms: 360ms;
  --leave-ms: 260ms;

  /* ✅ 仅用于遮罩玻璃的 token（你想更强/更弱直接改这里） */
  --glass-blur: 22px;
  --glass-saturate: 140%;
  --glass-brightness: 1.05;
  --glass-alpha: 0.32;
}

/* overlay root */
.tg-root {
  position: fixed;
  inset: 0;
  z-index: 4000;
}

/* =========================
   ✅ mask（唯一改动）：iOS Glass
   ========================= */
.tg-mask {
  position: absolute;
  inset: 0;

  /* 初始：几乎无影响 */
  background: rgba(255, 255, 255, 0.02);

  opacity: 0;

  /* 初始不启用玻璃，避免一闪 */
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  transition:
      opacity var(--mask-in-ms) var(--ease-out),
      background 320ms var(--ease-out),
      backdrop-filter 320ms var(--ease-out),
      -webkit-backdrop-filter 320ms var(--ease-out);
}

/* panel base（保持你原来的不动） */
.tg-panel {
  position: absolute;
  left: 50%;
  bottom: 14px;

  width: calc(100vw - 28px);
  max-width: 560px;

  background: #f6f6f7;
  border-radius: 18px;
  overflow: hidden;

  box-shadow:
      0 18px 60px rgba(0,0,0,.16),
      0 2px 10px rgba(0,0,0,.08);

  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 240px);
  min-height: 0;

  opacity: 0;
  transform: translateX(-50%) translateY(28px) scale(.985);

  transition:
      transform var(--enter-ms) var(--ease-out),
      opacity 220ms var(--ease-out);
}

/* PC：右侧浮动面板（保持你原来的不动） */
@media (min-width: 992px) {
  .tg-panel {
    left: auto;
    right: 18px;
    top: 18px;
    bottom: 18px;

    width: var(--pc-width, 520px);
    max-width: var(--pc-width, 520px);

    border-radius: 18px;

    height: auto;
    max-height: none;

    box-shadow:
        0 28px 80px rgba(0,0,0,.18),
        0 4px 14px rgba(0,0,0,.08);

    opacity: 0;
    transform: translateX(34px) scale(.99);
  }
}

/* ===== phases（只在 mask 上加玻璃；panel 动画保持原样） */

/* 进场：mask 淡入 + 玻璃渐进 */
.phase-enter-mask .tg-mask,
.phase-enter-panel .tg-mask,
.phase-open .tg-mask {
  opacity: 1;

  /* 白雾感（iOS glass 常见） */
  background: rgba(255, 255, 255, var(--glass-alpha));

  /* ✅ 用 unquote 防 sass 把 saturate 当函数解析 */
  backdrop-filter: unquote("blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))");
  -webkit-backdrop-filter: unquote("blur(var(--glass-blur)) saturate(var(--glass-saturate)) brightness(var(--glass-brightness))");
}

/* 进场：panel 原样 */
.phase-enter-panel .tg-panel,
.phase-open .tg-panel {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
@media (min-width: 992px) {
  .phase-enter-panel .tg-panel,
  .phase-open .tg-panel {
    transform: translateX(0) scale(1);
  }
}

/* 离开：panel 原样 */
.phase-leave-panel .tg-panel {
  opacity: 0;
  transition:
      transform var(--leave-ms) var(--ease-in),
      opacity 160ms var(--ease-in);
  transform: translateX(-50%) translateY(18px) scale(.985);
}
@media (min-width: 992px) {
  .phase-leave-panel .tg-panel {
    transform: translateX(34px) scale(.99);
  }
}

/* 离开：mask 淡出 + 玻璃回到 none */
.phase-leave-mask .tg-mask {
  opacity: 0;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  transition:
      opacity var(--mask-out-ms) var(--ease-in),
      background 240ms var(--ease-in),
      backdrop-filter 240ms var(--ease-in),
      -webkit-backdrop-filter 240ms var(--ease-in);
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .tg-mask, .tg-panel { transition: none !important; }
}

/* ===== header（保持你原来的不动） */
.tg-head {
  padding: 14px 14px 10px 14px;
  background: #f6f6f7;
}
.tg-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.tg-head-icon {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: rgba(0,0,0,.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tg-head-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tg-title {
  font-size: 15px;
  font-weight: 800;
  color: #111;
  line-height: 1.1;
}
.tg-subtitle {
  font-size: 12px;
  color: rgba(0,0,0,.48);
  line-height: 1.1;
}

/* ===== search（保持你原来的不动） */
.tg-search-wrap {
  padding: 0 12px 10px 12px;
  background: #f6f6f7;
}
.tg-search {
  display: flex;
  align-items: center;
  gap: 8px;

  background: rgba(255,255,255,.86);
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 14px;

  padding: 8px 10px;
}
.tg-search-icon {
  width: 16px;
  height: 16px;
  opacity: .75;
}
.tg-search-input {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #111;
  background: transparent;
  border: none;
  outline: none;
}
.tg-search-placeholder {
  color: rgba(0,0,0,.35);
  font-size: 13px;
}
.tg-search-clear {
  width: 16px;
  height: 16px;
  opacity: .7;
}

/* ===== body（保持你原来的不动） */
.tg-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 12px 12px 12px;
  &::-webkit-scrollbar { width: 0; height: 0; display: none; }
}

/* state */
.tg-state {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.72);
  border: 1px solid rgba(0,0,0,.05);
  margin-bottom: 10px;
}
.tg-state-text {
  font-size: 12px;
  color: rgba(0,0,0,.55);
}
.tg-state-error {
  font-size: 12px;
  color: #e5484d;
  font-weight: 700;
}

/* group */
.tg-group {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,.06);
  overflow: hidden;
  box-shadow: 0 1px 0 rgba(0,0,0,.03);
}
.tg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 12px 12px;
  background: #ffffff;
  transition: background .12s ease;
}
.tg-row + .tg-row {
  border-top: 1px solid rgba(0,0,0,.05);
}
.tg-row-hover { background: rgba(0,0,0,.02); }
.tg-row:active { background: rgba(0,0,0,.03); }

.tg-row-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.tg-row-title {
  font-size: 14px;
  font-weight: 800;
  color: #111;
  line-height: 1.1;
}
.tg-row-sub {
  font-size: 12px;
  color: rgba(0,0,0,.45);
  line-height: 1.1;
}
.tg-row-right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tg-check,
.tg-chevron {
  width: 18px;
  height: 18px;
  color: rgba(0,0,0,.75);
}
.tg-row.is-active {
  background: rgba(0,0,0,.015);
}

/* empty */
.tg-empty {
  margin-top: 10px;
  padding: 12px 12px;
  border-radius: 14px;
  background: rgba(255,255,255,.72);
  border: 1px solid rgba(0,0,0,.05);
}
.tg-empty-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #111;
}
.tg-empty-desc {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(0,0,0,.55);
}

/* bottom safe spacing */
.tg-foot {
  height: calc(10px + env(safe-area-inset-bottom));
  background: #f6f6f7;
}
</style>
