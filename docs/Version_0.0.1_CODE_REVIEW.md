# kantboot-frame-uniapp 0.0.1 版本梳理

> 梳理日期：2026-05-28

---

## 🔴 严重 Bug（功能直接出错）

### 1. `style/index.js:119` — `getWidthSize` 只能返回 `xs` 或 `sm`

`md` / `lg` / `xl` 永远无法返回，因为 `>= 768` 的屏幕在第二个 `if` 就直接 return 了。

```js
// 当前：对 1440px 的屏幕错误地返回 'sm'
if (viewportWidth >= 768) { return 'sm'; }
if (viewportWidth >= 992) { return 'md'; }  // 永远到不了这里

// 应改为（从大到小判断）：
if (viewportWidth >= 1920) return 'xl';
if (viewportWidth >= 1200) return 'lg';
if (viewportWidth >= 992)  return 'md';
if (viewportWidth >= 768)  return 'sm';
return 'xs';
```

---

### 2. `request.no.security.js:208-213` — 上传成功时同时触发 `stateSuccess` 和 `stateFail`

```js
if (json.success) {
    obj.stateSuccess(json);
} else if (json.stateCode === 'notLogin') {
    event.emit("notLogin");
}
obj.stateFail(json);  // ← 无论成功还是失败都会执行！
```

`stateSuccess` 分支执行后没有 `return`，导致 `stateFail` 也被调用。H5 分支（L239）存在同样的问题。

**修复**：在 `obj.stateSuccess(json)` 后加 `return`。

---

### 3. `request.no.security.js:44,59` — `toRequestReconnect` 参数传错

调用处传入 `(res, obj)`，但函数签名只接收一个参数 `(obj)`，导致函数拿到的是响应体 `res` 却当作请求配置来用，`obj.uri`、`getData(obj)` 都会出错。

```js
// 调用处
result.toRequestReconnect(res, obj);

// 函数签名（错误）
result.toRequestReconnect = function (obj) { ... }

// 应改为：
result.toRequestReconnect = function (res, obj) { ... }
```

---

### 4. `request.no.security.js:162-163` — H5/APP 上传分支中 `res` 未定义

```js
// #ifdef H5
let base64 = uni.arrayBufferToBase64(res.data);  // res 从哪来？会抛出 ReferenceError
```

H5 和 APP 两个条件编译分支中，`res` 均未声明，直接引用会报错，整段转换逻辑需要重写。

---

### 5. `event/index.js:75,81` — `addQueue` 重复调用 `queueAdd`

```js
result.addQueue = function (lastEmitEvent) {
    ...
    result.queueAdd(lastEmitEvent);  // L75，第一次调用
    result.emitCount++;
    storage.set(...);
    result.queueAdd(lastEmitEvent);  // L81，同一事件被重复入队！
}
```

---

### 6. `request.no.security.js:85-87` — 使用了不存在的 `event.$on` / `event.$off`

```js
event.$on(onKey, (res) => { ... });  // 不存在此方法
event.$off(onKey);                   // 不存在此方法

// 应改为：
event.on(onKey, (res) => { ... });
event.off(onKey);
```

---

### 7. `storage/index.js:159-163` — `removeByPrefix` 删除时 key 缺少命名空间前缀

`getKeysByPrefix` 返回的 key 已去掉 `"KANTBOOT-KEY:"` 前缀，但 `removeByPrefix` 用这个 stripped key 直接调用 `uni.removeStorageSync`，实际找不到对应 storage，删除无效。

```js
// 当前（错误）
uni.removeStorageSync(keys[i]);

// 应改为（走封装好的方法，自动补全前缀）
result.remove(keys[i]);
```

---

## 🟡 逻辑问题

### 8. `requestService.js:29` — `isJumpLogin` null 检查不完整

```js
// 当前：undefined 情况不会被处理
if (obj.isJumpLogin === null) {
    obj.isJumpLogin = true;
}

// 应改为：
if (obj.isJumpLogin == null) {  // == null 同时捕获 null 和 undefined
    obj.isJumpLogin = true;
}
```

---

### 9. `requestService.js:189-217` — `statusMap` 在模块加载时就调用 `i18n.zhToGlobal`

`statusMap` 是模块级别的常量，文件 import 时就会执行 `i18n.zhToGlobal(...)`，但此时语言包可能尚未加载，翻译会失败并回退为原始中文字符串。应改为懒加载（在实际使用时才翻译）。

---

### 10. `date/index.js:128` — 昨天判断跨月时出错

```js
// 当前：2月1日 和 1月31日 会判断失败
nowDate.getDate() - dateTimeDate.getDate() === 1

// 应改为用时间差判断：
Math.floor((now - dateTime) / (1000 * 60 * 60 * 24)) === 1
```

---

### 11. `style/index.js:241` — `toggleFontSize` 使用内存中的 mode，不感知存储更新

```js
// 当前：用内存值，可能是旧的
let mode = result.mode;

// 应改为：
let mode = result.getMode();
```

---

### 12. `util/index.js:85` — 字符串与数字比较，依赖隐式类型转换

`readableDistance` 和 `readableStorage` 中均有此问题，共出现 5 处：

```js
let aa = km2.substring(km2.indexOf(".") + 1);  // aa 是字符串
if (aa <= 10) { ... }  // 字符串和数字比较，不可靠

// 应改为：
if (parseInt(aa) <= 10) { ... }
```

---

## 🟠 跨平台安全问题

### 13. `window.location.href` 无平台保护（3 处）

以下三处 `getUrlParameter` 函数直接使用 `window.location.href`，在小程序/App 环境中会抛出 ReferenceError：

- `requestService.js:115`
- `storage/index.js:3`
- `router/index.js:6`

均需加 `// #ifdef H5` 条件编译保护。

---

### 14. `style/index.js:146` — `window.matchMedia` 无平台保护

```js
// #ifndef MP  ← 只排除了小程序，但 App 同样没有 window.matchMedia
return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// 应改为：
// #ifdef H5
```

---

## 🔵 代码质量问题

### 15. `requestService.js:152` — 硬编码业务项目码

```js
"projectCode": "kyghl",
```

这是框架库，不应硬编码具体业务的 `projectCode`，应移入 `request.config.js` 由使用方配置。

---

### 16. `i18n/index.js:165` — 使用了 `alert()`

小程序/App 环境无 `alert`，应改为 `uni.showModal` 或 `throw new Error()`。

---

### 17. `date/index.js:toReadable` — 硬编码中文字符串，未走 i18n

"刚刚"、"分钟前"、"昨天" 均为硬编码中文，在多语言应用中会出现显示问题，应接入 `i18n.get()`。

---

### 18. `storage/index.js:get` — 同一 key 多次读取 storage

`get` 函数中 `uni.getStorageSync(getKeyName(key))` 最多被调用 5 次，有性能浪费，应在函数开头读取一次：

```js
result.get = function (key) {
    const raw = uni.getStorageSync(getKeyName(key));
    if (!raw || !raw.value) return null;
    if (!raw.isHasEx) return raw.value;
    if (raw.expire < new Date().getTime()) {
        uni.removeStorageSync(getKeyName(key));
        return null;
    }
    return raw.value;
}
```

---

### 19. `../package.json` — 重复的 keywords

`"ui"` 出现 3 次，`"kantboot-app"` 出现 2 次，需清理。

---

### 20. `../index.js` — 缩进不一致

`image` 和 `router` 属性使用 tab 缩进，其他属性使用 4 个空格，需统一。

---

## 汇总

| 类别 | 数量 |
|------|------|
| 🔴 严重 Bug | 7 |
| 🟡 逻辑问题 | 5 |
| 🟠 跨平台安全 | 2 |
| 🔵 代码质量 | 6 |
| **合计** | **20** |

**优先修复**：第 1 条（`getWidthSize` 响应式断点失效，影响所有响应式布局）和第 2 条（上传成功后同时触发失败回调，影响所有文件上传功能）。
