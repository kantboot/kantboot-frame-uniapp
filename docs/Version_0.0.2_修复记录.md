# v0.0.2 修复记录 — 2026-05-29

完整问题来源：`docs/Version_0.0.2_CODE_REVIEW.md`

---

## 🔴 严重 Bug

**① `storage/index.js` — `clearByEx` 双重前缀，过期数据永远无法清除**

`uni.getStorageInfoSync().keys` 返回的已经是带 `"KANTBOOT-KEY:"` 前缀的完整 raw key，
原代码对这些 raw key 再次调用 `getKeyName()` 导致前缀叠加为 `"KANTBOOT-KEY:KANTBOOT-KEY:xxx"`，
该 key 在 storage 中根本不存在，读取结果始终为 `null`，过期判断和删除操作永远不会执行。

随着使用时间增长，所有通过 `setEx` 存入的带过期时间的数据（断网重连时间戳、事件队列、位置缓存等）到期后都不会被清除，storage 只增不减，在小程序 storage 容量上限（10MB）的环境下长期运行可能导致写入失败。

```js
// 修复前：对已带前缀的 raw key 再套一层 getKeyName，找不到真实数据
if (uni.getStorageSync(getKeyName(keys[i])).isHasEx) {
    if (uni.getStorageSync(getKeyName(keys[i])).expire < new Date().getTime()) {
        uni.removeStorageSync(getKeyName(keys[i]));
    }
}

// 修复后：直接使用 raw key，读取和删除均指向真实存在的条目
const raw = uni.getStorageSync(keys[i]);
if (raw && raw.isHasEx && raw.expire < new Date().getTime()) {
    uni.removeStorageSync(keys[i]);
}
```
