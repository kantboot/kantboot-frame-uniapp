import math from "../math";

let result = {};

/**
 * 生成UUID
 */
result.generateUUID = function (len) {
    len = len || 32;
    // 获取当前时间戳
    let timestamp = new Date().getTime()+"";
    let timestampLen = timestamp.length;
    // 如果len小于等于timestamp的长度，直接报错
    if(len <= math.evaluate(`${timestampLen}+10`)){
        throw new Error("UUID长度必须大于“时间戳的长度+10”，即len必须大于"+math.evaluate(`${timestampLen}+10`)+"位");
    }

    let $chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let maxPos = $chars.length;
    let uuid = '';
    for (let i = 0; i < len-timestampLen; i++) {
        uuid += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    uuid += timestamp;
    return uuid;
}

/**
 * 判断内容是否为空
 * 用来判断字符串、数组、对象是否为空（不包含0，0不属于空）
 * @return {boolean} 布尔类型：true代表字段为空，false 代表字段不为空
 */
result.isEmpty = function (value) {
    if(value===0){
        return false;
    }
    return !value;
}

/**
 * 将px转换为rpx
 */
result.pxToRpx = function (px) {
    return math.evaluate(`${px} * 750 / ${uni.getSystemInfoSync().windowWidth}`);
}

/**
 * 将rpx转换为px
 */
result.rpxToPx = function (rpx) {
    return math.evaluate(`${rpx} / 750 * ${uni.getSystemInfoSync().windowWidth}`);
}

/**
 * 将json按照key的字母顺序排序
 * 不改变原json,返回排序后的json
 * @param json
 * @return 排序后的json
 */
result.sortJSONByKey = function (json) {
    let arr = [];
    for (let key in json) {
        arr.push(key);
    }
    arr.sort();
    let newJson = {};
    for (let i = 0; i < arr.length; i++) {
        newJson[arr[i]] = json[arr[i]];
    }
    return newJson;
}

/**
 * 单词首字母大写
 */
result.firstLetterUpper = function (word) {
    return word.substring(0, 1).toUpperCase() + word.substring(1);
}

/**
 * 距离的读模式
 * @param m 米
 * @return {{unit: string, num: string}}
 */
result.readableDistance = function (m) {
    let m2 = m + "";
    m2 = m2.substring(m2.indexOf(".") + 1);

    let result = {
        unit: 'm',
        num: m2
    };


    if (m >= 1000) {
        let km = (m / 1000);
        let km2 = km.toFixed(2) + "";
        let aa = km2.substring(km2.indexOf(".") + 1);
        if (parseInt(aa) <= 10) {
            km2 = km2.substring(0, km2.indexOf("."));
        }
        result = {
            unit: 'km',
            num: km2
        };
    }
    return result;
}

/**
 * 距离的读模式
 */
result.readableDistanceReadMode = function (m) {
    let readableDistance = result.readableDistance(m);
    return readableDistance.num + readableDistance.unit;
}


/**
 * 获取存储单位的读格式
 */
result.readableStorage = function (storage) {
    let storage2 = storage + "";
    storage2 = storage2.substring(storage2.indexOf(".") + 1);

    let result = {
        unit: 'B',
        num: storage2
    };

    // 如果大于1tb
    if (storage >= 1024 * 1024 * 1024 * 1024) {
        let tb = (storage / (1024 * 1024 * 1024 * 1024));
        let tb2 = tb.toFixed(2) + "";
        let aa = tb2.substring(tb2.indexOf(".") + 1);
        if (parseInt(aa) <= 10) {
            tb2 = tb2.substring(0, tb2.indexOf("."));
        }
        return {
            unit: 'TB',
            num: tb2
        };
    }


    // 如果大于1gb
    if (storage >= 1024 * 1024 * 1024) {
        let gb = (storage / (1024 * 1024 * 1024));
        let gb2 = gb.toFixed(2) + "";
        let aa = gb2.substring(gb2.indexOf(".") + 1);
        if (parseInt(aa) <= 10) {
            gb2 = gb2.substring(0, gb2.indexOf("."));
        }
        return {
            unit: 'GB',
            num: gb2
        };
    }

    // 如果大于1mb
    if (storage >= 1024 * 1024) {
        let mb = (storage / (1024 * 1024));
        let mb2 = mb.toFixed(2) + "";
        let aa = mb2.substring(mb2.indexOf(".") + 1);
        if (parseInt(aa) <= 10) {
            mb2 = mb2.substring(0, mb2.indexOf("."));
        }
        return {
            unit: 'MB',
            num: mb2
        };
    }

    // 如果大于1kb
    if (storage >= 1024) {
        let kb = (storage / 1024);
        let kb2 = kb.toFixed(2) + "";
        let aa = kb2.substring(kb2.indexOf(".") + 1);
        if (parseInt(aa) <= 10) {
            kb2 = kb2.substring(0, kb2.indexOf("."));
        }
        return {
            unit: 'KB',
            num: kb2
        };
    }

    return result;

}

/**
 * readableStorage的读模式
 */
result.readableStorageReadMode = function (storage) {
    let readableStorage = result.readableStorage(storage);
    return readableStorage.num + readableStorage.unit;
}

/**
 * 对象深拷贝
 * @param json 对象
 * @returns {any} 拷贝后的对象
 */
result.deepCopy = function (json) {
    return JSON.parse(JSON.stringify(json));
}

export default result;
