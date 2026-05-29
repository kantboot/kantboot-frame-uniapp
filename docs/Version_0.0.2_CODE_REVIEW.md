# kantboot-frame-uniapp 0.0.2 版本 Code Review

> Review 日期：2026-05-29

---

## 0.0.1 → 0.0.2 修复确认

0.0.1 版本 review 中记录的 20 个问题，经核查结果如下：

| # | 问题 | 状态 |
|---|------|------|
| 1 | `getWidthSize` 响应式断点顺序错误 | ✅ 已修复 |
| 2 | 上传成功后同时触发 `stateFail` | ✅ 已修复 |
| 3 | `toRequestReconnect` 参数传错 | ✅ 已修复 |
| 4 | H5 上传分支 `res` 未定义 | ✅ 已修复 |
| 5 | `addQueue` 重复调用 `queueAdd` | ✅ 已修复 |
| 6 | `event.$on` / `event.$off` 不存在 | ✅ 已修复 |
| 7 | `removeByPrefix` key 缺少命名空间前缀 | ✅ 已修复 |
| 8 | `isJumpLogin` null 检查不完整 | ✅ 已修复 |
| 9 | `statusMap` 在模块加载时执行 i18n | ✅ 已修复 |
| 10 | 昨天判断跨月出错 | ✅ 已修复 |
| 11 | `toggleFontSize` 使用内存中的 mode | ✅ 已修复 |
| 12 | 字符串与数字隐式比较 | ✅ 已修复 |
| 13 | `window.location.href` 无平台保护 | ✅ 已修复 |
| 14 | `window.matchMedia` 平台保护范围不足 | ✅ 已修复 |
| 15 | `projectCode` 硬编码 | ✅ 已修复 |
| 16 | 使用了 `alert()` | ✅ 已修复 |
| 17 | `storage.get` 多次读取同一 key | ✅ 已修复 |
| 18 | `package.json` 重复 keywords | ✅ 已修复 |
| 19 | `index.js` 缩进不一致 | ✅ 已修复 |
| 20 | `toReadable` 硬编码中文，未走 i18n | ❌ 未修复，详见下文 |

---

## 🔴 严重 Bug

### 1. `storage/index.js:90-95` — `clearByEx` 双重前缀，过期清理完全失效

`uni.getStorageInfoSync().keys` 返回的是已带完整 namespace 的 raw key，如 `"KANTBOOT-KEY:foo"`。
`clearByEx` 对它们再次调用 `getKeyName(keys[i])`，结果变成 `"KANTBOOT-KEY:KANTBOOT-KEY:foo"`，
找不到对应 storage，`isHasEx` 判断永远无效，也就意味着**过期数据永远不会被清理**。

```js
// 当前（错误）：对已带前缀的 raw key 再次加前缀
if (uni.getStorageSync(getKeyName(keys[i])).isHasEx) {
    if (uni.getStorageSync(getKeyName(keys[i])).expire < new Date().getTime()) {
        uni.removeStorageSync(getKeyName(keys[i]));  // 删除的是不存在的 key
    }
}

// 应改为（直接用 raw key）：
const raw = uni.getStorageSync(keys[i]);
if (raw && raw.isHasEx && raw.expire < new Date().getTime()) {
    uni.removeStorageSync(keys[i]);
}
```

此 bug 会导致以 `setEx` 存储的断网重连时间戳、位置缓存、事件队列等数据永久残留，
随使用时间增长造成 storage 空间持续膨胀。

---

## 🟡 逻辑问题

### 2. `location/index.js:24` — 位置缓存注释与代码不一致，缓存只有 1 秒

注释写"判断是否超过30秒"，实际是 `+1000`（1秒），导致每次调用 `getLocation` 几乎都会重新请求定位，无法起到防抖作用。

```js
// 当前（错误）：缓存 1 秒
if(storage.get("location:timestamp") && storage.get("location:timestamp") + 1000 > Date.now()) {

// 应改为（缓存 30 秒）：
if(storage.get("location:timestamp") && storage.get("location:timestamp") + 1000 * 30 > Date.now()) {
```

---

### 3. `image/index.js:21-25` — `toImageClip` 事件监听未解绑，内存泄漏

`event.on(uuid, callback)` 注册的监听器在 Promise resolve 之后没有 `event.off(uuid)` 清除，
每次调用 `toImageClip` 都会累积一个永不释放的监听器。

```js
// 当前（错误）：
return new Promise((resolve, reject) => {
    event.on(uuid, (data) => {
        resolve(data);         // 没有 off
    });
});

// 应改为：
return new Promise((resolve, reject) => {
    event.on(uuid, (data) => {
        event.off(uuid);       // 先 off 再 resolve
        resolve(data);
    });
});
```

---

### 4. `util/index.js:86-88` — `readableDistance` 在米数有小数时 `num` 字段只含小数部分

```js
let m2 = m + "";
m2 = m2.substring(m2.indexOf(".") + 1);  // 取小数点后的内容
let result = { unit: 'm', num: m2 };
```

当 `m = 500`（无小数点）时，`indexOf(".")` 返回 `-1`，`substring(0)` 返回完整字符串 `"500"`，结果正确。
但当 `m = 500.5` 时，结果为 `{ unit: 'm', num: '5' }`，显示为 "5m"，而期望是 "500m" 或 "501m"。

```js
// 应改为直接取整数部分：
let result = { unit: 'm', num: Math.round(m) + "" };
```

---

### 5. `date/index.js:131-133` — `toReadable` 同年判断额外限制了月份相同

当前逻辑在"同一天"和"昨天"之后，下一个分支检查：

```js
if (
    nowDate.getFullYear() === dateTimeDate.getFullYear() &&
    nowDate.getMonth() === dateTimeDate.getMonth()      // 多余条件
) {
    return result.format(dateTime, "MM-dd hh:mm");
}
```

同年但不同月的时间（如今天 5 月，历史日期 3 月）不满足条件，会跳到最后一行显示 `yyyy-MM-dd hh:mm`，反而比预期更冗余。

```js
// 应改为只判断年份：
if (nowDate.getFullYear() === dateTimeDate.getFullYear()) {
    return result.format(dateTime, "MM-dd hh:mm");
}
```

---

## 🔵 代码质量问题

### 6. `style/index.js:251-254` — `toggleColor` 未完成实现，存在 `undefined` 返回

```js
result.toggleColor = (color) => {
    let mode = result.mode;   // 直接读内存，不走 getMode()
    if (!mode.dark) {         // mode 对象里没有 dark 字段，永远为 falsy
        return color;
    }
    // 当 mode.dark 为 true 时没有 return，函数返回 undefined
}
```

`mode` 结构中没有 `dark` 字段，颜色模式用的是 `colorScheme`。该函数目前对调用方无任何意义，应完成实现或删除。

---

### 7. `file/file.config.js:3-5` — 硬编码特定项目域名

```js
let config = {
    staticFileAddress: 'https://static-file.laoxiangyizhan.com',
    visitFileAddress: `https://api.laoxiangyizhan.com/functional-file-web/file/visit`,
    fileUploadAddress: `https://api.laoxiangyizhan.com/functional-file-web/file/upload`,
}
```

这是框架库，不应硬编码业务项目的域名。应全部移入配置项，由使用方注入。

---

### 8. `requestService.js:174` 和 `request.no.security.js:214` — 硬编码登录页路径

```js
// requestService.js:174-178
uni.navigateTo({ url: "/pages/login/login" });

// request.no.security.js:214-216
uni.navigateTo({ url: "/pages/login/login" });
```

框架库中不应固定业务的路由路径。两处均应改为使用 `router.config.js` 中已有的 `loginPath` 配置：

```js
import router from "../router";
// ...
uni.navigateTo({ url: router.config.loginPath });
```

---

### 9. `storage/index.js:143` — `getKeysByPrefix` 内部变量 `result` 遮蔽外部对象

```js
result.getKeysByPrefix = (prefix) => {
    // ...
    let result = [];   // 遮蔽了外部 result 对象
    for (let i = 0; i < keys.length; i++) {
        // ...
        result.push(...);
    }
    return result;
}
```

函数内的 `let result = []` 在块作用域内屏蔽了外部的模块 `result` 对象，虽然功能上不影响（新变量是块级），但极易造成误读和后续修改出错。

```js
// 应重命名：
let matchedKeys = [];
// ...
return matchedKeys;
```

---

### 10. `date/index.js:toReadable` — 硬编码中文字符串，未走 i18n（遗留自 0.0.1）

"刚刚"、"分钟前"、"昨天 " 三处仍为硬编码中文，在多语言应用中将直接显示中文。应接入 `i18n.get()` 或由调用方传入文案。

---

## 汇总

| 类别 | 数量 |
|------|------|
| 🔴 严重 Bug | 1 |
| 🟡 逻辑问题 | 4 |
| 🔵 代码质量 | 5 |
| **合计** | **10** |

**优先修复**：第 1 条（`clearByEx` 过期清理失效，会导致 storage 数据无限积累）。第 2 条（位置缓存时间配置错误，导致频繁重复定位请求）。
