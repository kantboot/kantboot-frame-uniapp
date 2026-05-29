# kantboot-frame-uniapp

`kantboot-frame-uniapp` 是 Kantboot 面向 uni-app 的前端基础库，提供常用 UI 组件、网络请求、路由跳转、文件、图片、国际化、样式模式、缓存、事件、日期、数学等工具封装。

当前模块按 `uni_modules` 插件形式组织，适用于 uni-app Vue2 项目，可在 H5、App、小程序等端复用。

> 注意：本项目更适合在 Kantboot 体系内部项目中使用。请求响应结构、文件服务、路由约定、用户账号、国际化、样式变量等能力均默认贴合 Kantboot 后端和 Kantboot 前端工程约定。外部项目也可以按需接入，但通常需要根据自身接口规范和页面结构调整配置或二次封装。

## 特性

- 面向 Kantboot 体系内部工程沉淀，适合与 Kantboot 后端服务、文件服务、用户体系和多语言体系配套使用。
- 内置 Kantboot 常用 UI 组件，如按钮、导航栏、弹窗、轮播、图标、格式化内容等。
- 封装请求工具，支持统一根地址、token 请求头、响应字段、登录状态码等配置。
- 封装路由工具，支持 `navigateTo`、`redirectTo`、`reLaunch`、返回、WebView 跳转等能力。
- 提供文件上传/访问、图片处理、用户账号、国际化、缓存、事件总线、日期、数学和通用工具。
- 内置跨端窗口变化监听，统一触发 `window:resize` 事件。

## 目录结构

```text
kantboot-frame-uniapp
├── components/              # uni-app 组件
│   ├── kt-button/           # 按钮组件
│   ├── kt-carousel/         # 轮播图组件
│   ├── kt-container/        # 响应式容器
│   ├── kt-format/           # 格式化内容展示
│   ├── kt-icon/             # 图标组件
│   ├── kt-nav-bar/          # 导航栏组件
│   └── ...
├── libs/                    # 工具库
│   ├── request/             # 网络请求
│   ├── router/              # 路由跳转
│   ├── file/                # 文件相关
│   ├── image/               # 图片相关
│   ├── i18n/                # 国际化
│   ├── storage/             # 本地缓存
│   └── ...
├── index.css                # 全局样式变量和基础样式
├── index.js                 # 统一导出入口
└── package.json             # uni_modules 插件信息
```

## 安装

将本目录放入 uni-app 项目的 `uni_modules/kantboot-frame-uniapp` 目录中：

```text
your-uniapp-project
└── uni_modules
    └── kantboot-frame-uniapp
```

也可以按项目实际约定放入 `uni_modules/kantboot`，但引入路径需要与目录名保持一致。

## 引入

在 `main.js` 中引入并挂载到 Vue 原型：

```js
import Vue from "vue";
import kt from "@/uni_modules/kantboot-frame-uniapp";
import "@/uni_modules/kantboot-frame-uniapp/index.css";

Vue.prototype.$kt = kt;
```

挂载后，页面和组件内可以通过 `this.$kt` 使用工具库：

```js
this.$kt.router.navTo("/pages/index/index", { id: 1 });
this.$kt.storage.set("token", "xxx");
```

## 导出模块

`index.js` 默认导出以下模块：

| 模块 | 说明 |
| --- | --- |
| `math` | 数学工具 |
| `util` | 通用工具 |
| `event` | 事件总线 |
| `request` | 网络请求 |
| `style` | 样式和模式相关能力 |
| `i18n` | 国际化 |
| `userAccount` | 用户账号相关封装 |
| `file` | 文件上传、访问等能力 |
| `date` | 日期工具 |
| `location` | 位置相关工具 |
| `image` | 图片相关工具 |
| `router` | 页面跳转工具 |
| `storage` | 本地缓存工具 |

## 网络请求

请求模块位于 `libs/request`，默认配置在 `libs/request/request.config.js`。

核心配置项包括：

| 配置项 | 说明 |
| --- | --- |
| `rootAddress` | 接口根地址 |
| `fileAddress` | 文件访问地址 |
| `fileUploadAddress` | 文件上传地址 |
| `websocketAddress` | WebSocket 根地址 |
| `headerField.authorization` | token 对应的请求头字段 |
| `responseDataField` | 后端响应字段映射 |
| `stateCode.success` | 成功状态码 |
| `stateCode.notLogin` | 未登录状态码 |

使用示例：

```js
this.$kt.request.post("/system/user/info", {
  data: {
    id: 1
  }
}).then((res) => {
  console.log(res);
}).catch((err) => {
  console.error(err);
});
```

也可以使用底层 `send` 方法，并传入状态回调：

```js
this.$kt.request.send({
  uri: "/system/user/info",
  method: "POST",
  data: {
    id: 1
  },
  stateSuccess: (res) => {
    console.log("success", res);
  },
  stateFail: (err) => {
    console.log("fail", err);
  }
});
```

更多说明见 `libs/request/README.md`。

## 路由工具

路由模块位于 `libs/router`，支持带参数拼接和常用跳转。

```js
// 普通跳转
this.$kt.router.navTo("/pages/detail/detail", { id: 1 });

// 重定向
this.$kt.router.redirectTo("/pages/login/login");

// 关闭所有页面并打开目标页
this.$kt.router.reLaunch("/pages/index/index");

// 返回上一页
this.$kt.router.navBack();

// 打开 WebView
this.$kt.router.toWebview("https://www.kantboot.com", {
  title: "Kantboot",
  isHideNavBar: false,
  params: {
    from: "app"
  }
});
```

页面路径可在 `libs/router/router.config.js` 中按项目需要调整。

## 组件

组件位于 `components` 目录，可按 uni-app 组件规范直接使用。

| 组件 | 说明 |
| --- | --- |
| `kt-button` | 带 loading、success、error 状态的按钮 |
| `kt-carousel` | 轮播图 |
| `kt-container` | 响应式容器，会根据宽度标记 `xs`、`sm`、`md`、`lg`、`xl` |
| `kt-format` | 富内容/格式化内容展示 |
| `kt-icon` | 图标展示 |
| `kt-inline-number-keyboard` | 行内数字键盘 |
| `kt-keyboard-size` | 键盘尺寸辅助组件 |
| `kt-language-select-popup` | 语言选择弹窗 |
| `kt-nav-bar` | 自定义导航栏 |
| `kt-one-line-text` | 单行文本展示 |
| `kt-popup` | 弹窗 |

### kt-button 示例

```html
<template>
  <kt-button ref="submitBtn" common="black" @click="submit">
    登录
  </kt-button>
</template>

<script>
export default {
  methods: {
    submit() {
      this.$refs.submitBtn.loading();

      this.$kt.request.post("/login", {
        data: {
          username: "admin",
          password: "123456"
        }
      }).then(() => {
        this.$refs.submitBtn.success("登录成功");
      }).catch(() => {
        this.$refs.submitBtn.error("账号或密码错误");
      });
    }
  }
};
</script>
```

更多按钮说明见 `components/kt-button/README.md`。

### kt-container 示例

```html
<kt-container @change="onContainerChange">
  <view>页面内容</view>
</kt-container>
```

```js
export default {
  methods: {
    onContainerChange(size) {
      console.log(size.xs, size.sm, size.md, size.lg, size.xl);
    }
  }
};
```

## 样式

项目入口需要引入 `index.css`：

```js
import "@/uni_modules/kantboot-frame-uniapp/index.css";
```

该文件包含 Kantboot UI 的基础样式变量、布局样式和组件公共样式。组件内部也会读取部分 CSS 变量，建议统一在应用入口引入。

## 配置建议

生产项目中建议不要直接修改插件源码中的配置文件，而是在项目启动时覆盖配置：

```js
import kt from "@/uni_modules/kantboot-frame-uniapp";

kt.request.config.rootAddress = "https://api.example.com";
kt.request.config.headerField.authorization = "Authorization";
kt.request.config.stateCode.success = "SUCCESS";

Vue.prototype.$kt = kt;
```

如需维护多环境配置，可在项目根目录建立独立配置文件，再在 `main.js` 中按环境写入 `kt.request.config`。

## 平台支持

根据 `package.json` 中的 `uni_modules.platforms` 声明，当前模块面向以下平台：

- Vue2 uni-app 项目
- App Vue / App nvue
- H5 移动端和 PC 端
- 微信、支付宝、百度、字节跳动、QQ 小程序
- 华为快应用、联盟快应用
- 腾讯云、阿里云相关云能力

## 开发说明

- 新增工具库时，建议放入 `libs/<module>/index.js`，并在根目录 `index.js` 中统一导出。
- 新增组件时，建议放入 `components/<component-name>/<component-name>.vue`。
- 组件 README 可放在各组件目录下，复杂工具库也可在对应 `libs` 子目录维护说明文档。
- 请求、文件、路由等默认配置会被打包进前端，请勿写入敏感信息。

## 相关文档

- `libs/request/README.md`
- `libs/math/README.md`
- `components/kt-button/README.md`
- `components/kt-carousel/README.md`

---

## 版本修复记录

### v0.0.1 — 2026-05-28

完整问题来源：`docs/Version_0.0.1_CODE_REVIEW.md`

#### 🔴 严重 Bug

**① `style/index.js` — `getWidthSize` 响应式断点失效**

原代码从小到大写 `if`，每个分支都有 `return`，导致 `>= 768px` 的屏幕在第二个 `if` 就返回 `'sm'`，`md` / `lg` / `xl` 永远不可达。改为从大到小判断后问题消除。

```js
// 修复后
if (viewportWidth >= 1920) return 'xl';
if (viewportWidth >= 1200) return 'lg';
if (viewportWidth >= 992)  return 'md';
if (viewportWidth >= 768)  return 'sm';
return 'xs';
```

---

**② `request.no.security.js` — 文件上传成功时同时触发 `stateSuccess` 和 `stateFail`**

`if (json.success)` 分支调用 `stateSuccess` 后缺少 `return`，导致无论成功失败 `stateFail` 都会被调用。在 `stateSuccess` 后补 `return` 修复，`#ifndef H5` 和 `#ifdef H5` 两个分支均已处理。

---

**③ `request.no.security.js` — `toRequestReconnect` 参数传递错误**

调用处为 `result.toRequestReconnect(res, obj)`（传入响应体和请求配置），但函数签名只声明了一个参数 `(obj)`，导致函数内拿到的是响应体 `res` 却当作请求配置使用，`obj.uri`、`getData(obj)` 全部出错。修复为 `function(res, obj)`，函数体内正确使用 `obj`。

---

**④ `request.no.security.js` — H5 / APP 上传分支中 `res` 未定义**

`#ifdef H5` 和 `#ifdef APP` 的本地路径转换块内直接引用了作用域内不存在的 `res` 变量，会抛出 `ReferenceError`。H5 和 APP 环境下远程 URL 可直接用于上传，无需转换，移除该两段无效代码。

---

**⑤ `event/index.js` — `addQueue` 重复调用 `queueAdd`**

函数内 `result.queueAdd(lastEmitEvent)` 被调用了两次，同一事件会被重复入队。移除第一处多余的调用（原 L75），保留计数自增和存储操作后的那次调用。

---

**⑥ `request.no.security.js` — 使用了不存在的 `event.$on` / `event.$off`**

断网重连回调中调用了 `event.$on` 和 `event.$off`，但 `event` 模块对外暴露的方法是 `event.on` 和 `event.off`。修复为正确的方法名。

---

**⑦ `storage/index.js` — `removeByPrefix` 删除时 key 缺少命名空间前缀**

`getKeysByPrefix` 返回的是去掉 `"KANTBOOT-KEY:"` 前缀后的 key，但 `removeByPrefix` 直接将这些 key 传给 `uni.removeStorageSync`，找不到实际存储条目，删除无效。改为调用封装好的 `result.remove(key)`，由其内部补全命名空间前缀后再删除。

---

#### 🟡 逻辑问题

**⑧ `requestService.js` — `isJumpLogin` null 检查不完整**

`obj.isJumpLogin === null` 无法捕获 `undefined` 的情况（调用方未传该字段时值为 `undefined`），导致默认值无法生效。改为 `obj.isJumpLogin == null`（宽松比较），同时捕获 `null` 和 `undefined`。

---

**⑨ `requestService.js` — `statusMap` 在模块加载时就执行 `i18n.zhToGlobal`**

`statusMap` 是模块级常量，`import` 时就会调用 `i18n.zhToGlobal`，但此时语言包通常尚未加载，翻译结果始终是原始中文。将其改为函数 `getStatusMap()`，在实际需要生成错误对象时才调用，确保语言包已加载。

---

**⑩ `date/index.js` — 昨天判断跨月时出错**

原判断 `nowDate.getDate() - dateTimeDate.getDate() === 1` 在跨月（如 2月1日 与 1月31日）时结果为负数，判断失败。改为用时间差 `Math.floor((now - dateTime) / (1000 * 60 * 60 * 24)) === 1` 判断，与日历无关，跨月正确。

---

**⑪ `style/index.js` — `toggleFontSize` 读取了内存中可能过时的 `mode`**

`result.mode` 是模块初始化时的内存值，若存储中的 mode 已被 `setMode` 更新，内存值不会同步刷新。改为 `result.getMode()` 每次从存储中读取最新值。

---

**⑫ `util/index.js` — 字符串与数字比较，依赖隐式类型转换（5 处）**

`readableDistance` 和 `readableStorage` 中，`aa` 是 `substring` 截取的字符串，直接与数字 `10` 做 `<=` 比较依赖 JS 隐式类型转换，行为不稳定。改为 `parseInt(aa) <= 10`，共修复 5 处。

---

#### 🟠 跨平台安全问题

**⑬ `getUrlParameter` 无平台保护（3 处）**

`requestService.js`、`storage/index.js`、`router/index.js` 中的 `getUrlParameter` 函数体直接使用 `window.location.href`，在小程序 / App 环境中会抛出 `ReferenceError`。三处均改为在函数体内以 `// #ifdef H5` / `// #ifndef H5` 包裹，非 H5 环境直接返回 `null`。

---

**⑭ `style/index.js` — `window.matchMedia` 无平台保护**

原用 `// #ifndef MP` 排除小程序，但 App 环境同样没有 `window.matchMedia`。改为 `// #ifdef H5` 严格限定只在 H5 下调用，非 H5 环境默认返回 `'light'`。

---

#### 🔵 代码质量问题

**⑮ `request.config.js` — 新增 `projectCode` 配置项，移除硬编码**

`requestService.js` 中硬编码了业务项目码 `"kyghl"`，作为框架库不应包含特定业务值。在 `request.config.js` 中新增 `projectCode: ""` 配置项，`requestService.js` 改为读取 `requestConfig.projectCode`，使用方在 `main.js` 中按项目覆盖配置即可。

```js
kt.request.config.projectCode = "myProject";
```

---

**⑯ `i18n/index.js` — `alert()` 替换为 `throw new Error()`**

`loadLanguagePackage` 中对未初始化语言包的提示使用了 `alert()`，小程序 / App 环境不存在此方法。改为抛出 `Error`，调用方可在 `catch` 中处理或展示提示。

---

**⑰ `storage/index.js` — `get` 函数多次读取 storage 改为单次**

原 `get` 函数对同一 key 最多调用 `uni.getStorageSync` 5 次。重构为在函数开头读取一次赋值给 `raw`，后续所有判断均基于该变量，减少 I/O 开销。

---

**⑱ `package.json` — 清理重复 keywords**

`"ui"` 出现 3 次、`"kantboot-app"` 出现 2 次，清理为各保留 1 条。

---

**⑲ `index.js` — 统一缩进**

`image` 和 `router` 属性使用了 tab，其余属性使用 4 个空格，统一改为 4 个空格缩进。

---

#### ⚠️ 从旧版升级的兼容说明

以下修复涉及行为变更，从旧版升级时需要检查旧项目代码。

---

**兼容项 1 — `getWidthSize` 响应式断点（视觉变化，需回归测试）**

旧版 `getWidthSize` 因 `if` 顺序错误，始终只能返回 `'xs'` 或 `'sm'`，`md` / `lg` / `xl` 从未生效。`toggleClass` 依赖此函数生成的 CSS 类名（如 `xxx-mode-width-size-md`）在旧版中始终不会被添加。

升级后宽屏下这些类名将真正生效，**页面布局在 PC 端或宽屏设备上可能发生变化**。

建议升级后在 PC 浏览器和宽屏设备上完整走查一遍页面。

---

**兼容项 2 — `isJumpLogin` 默认值从 `undefined`（不跳转）变为 `true`（自动跳转）**

旧版 `check` 函数使用 `===` 判断，无法捕获 `undefined`，导致调用方不传 `isJumpLogin` 时该字段保持 `undefined`（falsy），遇到 `notLogin` 状态不会自动跳转登录页。修复后默认值正确设为 `true`，不传该字段时会自动跳转。

| 场景 | 旧版行为 | 新版行为 |
|---|---|---|
| 不传 `isJumpLogin` | 不跳转（undefined 为 falsy，bug）| **自动跳转登录页** |
| `isJumpLogin: false` | 不跳转 | 不跳转（不变）|
| `isJumpLogin: true` | 跳转 | 跳转（不变）|

如果旧项目有接口在未登录时不希望自动跳转，需显式补上 `isJumpLogin: false`：

```js
request.send({
    isJumpLogin: false,
    uri: "/xxx/yyy",
    ...
})
```

---

**兼容项 3 — `projectCode` 不再硬编码，默认变为空字符串**

旧版 `requestService.js` 中 `projectCode` 硬编码为 `"kyghl"`，升级后该值从 `request.config.projectCode` 读取，默认为 `""`。

如果后端依赖请求头中的 `projectCode` 字段做路由或鉴权，升级后请求头中该字段将变为空字符串，**可能导致接口报错或鉴权失败**。

需在项目初始化时补上配置（优先级最高，建议升级后第一时间处理）：

```js
// main.js
import kt from "@/uni_modules/kantboot-frame-uniapp";

kt.request.config.projectCode = "kyghl";  // 改为项目实际使用的值
Vue.prototype.$kt = kt;
```

---

**兼容项 4 — 文件上传成功时不再同时触发 `stateFail`**

旧版 `uploadFile` 的 `success` 回调中，`stateSuccess` 调用后缺少 `return`，导致无论上传成功还是失败，`stateFail` 都会被执行。如果旧项目在 `stateFail` 回调中写了"无论如何都要执行"的逻辑（如关闭 loading、重置按钮状态），升级后这部分逻辑在上传成功时将不再执行。

```js
// 升级前：stateSuccess 和 stateFail 都会执行
// 升级后：成功只执行 stateSuccess，失败只执行 stateFail

// 如果有需要在上传结束后无论成功失败都要运行的逻辑，
// 请分别在 stateSuccess 和 stateFail 中各加一份，或封装为公共函数调用
request.uploadFile({
    data: { file: filePath, groupCode: "avatar" },
    stateSuccess: (res) => {
        hideLoading();   // 需要手动加回来
        onSuccess(res);
    },
    stateFail: (err) => {
        hideLoading();   // 原来依赖 stateFail 兜底的逻辑
        onFail(err);
    }
});
```

---

#### 升级检查清单

| 检查项 | 优先级 | 操作 |
|---|---|---|
| 在 `main.js` 中补上 `kt.request.config.projectCode` | 🔴 高 | 必须处理，否则接口可能报错 |
| 检查 `uploadFile` 的 `stateFail` 回调是否包含收尾逻辑 | 🟡 中 | 视项目情况处理 |
| 检查无显式 `isJumpLogin` 的 `request.send` 调用 | 🟡 中 | 不想自动跳转的加 `isJumpLogin: false` |
| 在 PC / 宽屏设备上走查页面布局 | 🟡 中 | 验证响应式样式符合预期 |
