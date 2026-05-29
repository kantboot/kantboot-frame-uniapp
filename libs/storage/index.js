let result = {};

let getUrlParameter=(name) => {
    // #ifdef H5
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
    // #endif
    // #ifndef H5
    return null;
    // #endif
}
let getKeyName = function (key) {
    // #ifdef H5
    let token = getUrlParameter("token");
    if(token){
        return "KANTBOOT-TOKEN-KEY:"+token+":" + key;
    }
    // #endif

    return "KANTBOOT-KEY:" + key;
}

/**
 * 设置存储
 */
result.set = function (key, value,expire) {
    if(expire){
        result.setEx(key, value, expire);
        return;
    }
    let json = {
        // 存储的值
        value: value,
        // 是否有过期时间
        isHasEx: false,
    }
    uni.setStorageSync(getKeyName(key), json);
}

/**
 * 设置存储 且 设置过期时间（单位：毫秒）
 */
result.setEx = function (key, value, expire) {
    let json = {
        // 存储的值
        value: value,
        // 是否有过期时间
        isHasEx: true,
        // 过期时间
        expire: new Date().getTime() + expire,
    }
    uni.setStorageSync(getKeyName(key), json);
}

/**
 * 删除存储
 */
result.remove = function (key) {
    uni.removeStorageSync(getKeyName(key));
}

/**
 * 获取存储
 */
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

/**
 * 清空过期的存储
 */
let clearByEx = function () {
    let keys = uni.getStorageInfoSync().keys;
    for (let i = 0; i < keys.length; i++) {
        // 如果不是"KANTBOOT-KEY:"开头的存储
        if (!keys[i].startsWith("KANTBOOT-KEY:")) {
            continue;
        }
        if (uni.getStorageSync(getKeyName(keys[i])).isHasEx) {
            if (uni.getStorageSync(getKeyName(keys[i])).expire < new Date().getTime()) {
                uni.removeStorageSync(getKeyName(keys[i]));
            }
        }
    }
}
result.clearByEx = clearByEx;

/**
 * 加锁
 */
result.addLock = function (key) {
    let lockKey = getKeyName(key) + "-LOCK";
    result.setEx(lockKey, true, 1000);
}

/**
 * 判断是锁住
 */
result.isLock = function (key) {
    let lockKey = getKeyName(key) + "-LOCK";
    return !!result.get(lockKey);
}

/**
 * 存储锁
 */
result.lock = function (key) {
    if (result.isLock(key)) {
        return false;
    }
    result.addLock(key);
    return true;
}

/**
 * 解锁
 */
result.unlock = function (key) {
    let lockKey = getKeyName(key) + "-LOCK";
    result.remove(lockKey);
}

/**
 * 根据前缀获取存储的key
 */
result.getKeysByPrefix =  (prefix)=> {
    // 清空过期的存储
    // result.clearByEx();
    clearByEx();
    let keys = uni.getStorageInfoSync().keys;
    let result = [];
    for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith(getKeyName(prefix))) {
            result.push(keys[i].substring(getKeyName("").length));
        }
    }
    return result;
}

/**
 * 根据前缀删除存储
 */
result.removeByPrefix =  (prefix)=> {
    let keys = result.getKeysByPrefix(prefix);
    for (let i = 0; i < keys.length; i++) {
        result.remove(keys[i]);
    }
}


export default result;