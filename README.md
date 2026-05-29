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