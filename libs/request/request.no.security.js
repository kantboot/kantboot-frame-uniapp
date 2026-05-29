import storage from "../storage";
import event from "../event";
import requestService from "./requestService";

let result = {
};


/**
 * 设置token
 * @param token
 */
result.setToken = (token) => {
    storage.set("token", token);
}

/**
 * 获取token
 * @returns {string}
 */
result.getToken = () => {
    return storage.get("token");
}

/**
 * 发送请求
 * @param obj
 */
result.send = function (obj) {
    obj = requestService.check(obj);

    uni.request({
        url: requestService.getUrl(obj),
        data: requestService.getData(obj),
        method: requestService.getMethod(obj),
        header: requestService.getHeader(obj),
        fail: (res) => {
            console.log(res, "request:fail:fail")
        },
        complete: (res) => {
            requestService.complete(res, obj);
            // 判断是否断网
            if (res.errMsg.startsWith("request:fail") && obj.isReconnect) {
                result.toRequestReconnect(res, obj);
            }
            if(res.stateCode && res.stateCode === "notLogin") {
                console.log("未登录")
                event.emit("notLogin");
            }
        }
    });
}



/**
 * 前往重连
 */
result.toRequestReconnect = function (res, obj) {
    let data = requestService.getData(obj);
    let dataString = JSON.stringify(data);
    let onKey = obj.uri + "_$_$_" + dataString;

    // 获取此次断网重连的时间戳
    let requestReconnectTime = new Date().getTime();
    // 保存断网重连的时间戳
    storage.setEx("requestReconnectTimeByOnKey:" + onKey, requestReconnectTime, 1000 * 60 * 60 * 24 * 7);
    // 设置断网重连的次数为0
    storage.setEx("requestReconnectNumberByOnKey:" + onKey, 0, 1000 * 60 * 60 * 24);
    // 断网重连
    result.requestReconnect(obj, onKey, requestReconnectTime);
}

/**
 * 断网重连
 */
result.requestReconnect = function (obj, onKey, requestReconnectTime) {

    // 获取断网重连的时间戳
    let requestReconnectTimeNow = storage.get("requestReconnectTimeByOnKey:" + onKey);
    // 如果断网重连的时间戳变化了，则不进行断网重连
    if (requestReconnectTimeNow > requestReconnectTime) {
        // 断网重连的时间戳变化了，说明有新一次相同onKey的请求进入，取消断网重连
        // 监听新一次相同onKey的请求
        event.on(onKey, (res) => {
            requestService.complete(res, obj);
            event.off(onKey);
        });
        console.log("有新一次相同onKey的请求进入，断网重连取消", onKey, requestReconnectTimeNow)
        return;
    }

    let storageKey = "requestReconnectNumberByOnKey:" + onKey;
    // 断网重连次数
    let requestReconnectNumber = storage.get(storageKey);
    // 如果没有断网重连次数则设置为0
    if (!requestReconnectNumber) {
        requestReconnectNumber = 0;
    }

    // 断网重连次数加1
    requestReconnectNumber++;
    // 保存断网重连次数
    storage.setEx(storageKey, requestReconnectNumber, 1000 * 60 * 60 * 24);


    // 设置成为非断网重连
    obj.isReconnect = false;
    // 设置成重连状态
    obj.isReconnectState = true;
    result.send({
        ...obj,
        getIsRequestOk: function (isRequestOk, res) {
            if (isRequestOk) {
                // 断网重连成功
                console.log("断网重连成功", onKey, requestReconnectNumber, requestReconnectTime);
                event.emit(onKey, res);
                return;
            }
            // 断网重连失败
            console.log("继续断网重连", onKey, requestReconnectNumber, requestReconnectTime);
            setTimeout(() => {
                result.requestReconnect(obj, onKey, requestReconnectTime);
            }, 100);
        }
    });
}


/**
 * 上传文件
 */
result.uploadFile = async function (obj) {
    obj = requestService.check(obj);
    if (!obj.name) {
        obj.name = "file";
    }
    obj.filePath = obj.data.file;

    let fileSrc = obj.data.file;
    // #ifdef MP-WEIXIN
    // 如果fileSrc的前缀不是http://tmp,且是http:// 或 https://开头的，则转换为本地路径
    if (fileSrc.indexOf("http://tmp") !== 0 && (fileSrc.indexOf("http://") === 0 || fileSrc.indexOf("https://") === 0)) {
        await new Promise((resolve, reject) => {
            uni.downloadFile({
                url: fileSrc,
                success: (res) => {
                    obj.data.file = res.tempFilePath;
                    obj.filePath = obj.data.file;

                    console.log(res.tempFilePath, "下载文件成功");
                    resolve("");
                }
            })
        });
    }
    // #endif
    // #ifdef H5
    // H5 环境下远程 URL 可直接上传，无需转换本地路径
    // #endif
    // #ifdef APP
    // APP 环境下远程 URL 可直接上传，无需转换本地路径
    // #endif

    // #ifndef H5
    uni.uploadFile({
        url: requestService.getUploadUrl(),
        filePath: obj.data.file,
        name: "file",
        formData: {
            groupCode: obj.data.groupCode
        },
        data: {
            groupCode: obj.data.groupCode
        },
        method: requestService.getMethod(obj),
        header: requestService.getHeader(obj),
        success: (res) => {
            console.log(res, "上传文件返回结果");
            let json = JSON.parse(res.data);
            console.log(json, "上传文件返回结果");
            if (json.success) {
                obj.stateSuccess(json);
                return;
            }
            if (json.stateCode === 'notLogin') {
                event.emit("notLogin");
            }
            obj.stateFail(json);
        },
        fail: (err) => {
            obj.stateFail(err);
        }
    })
    // #endif

    // #ifdef H5
    uni.uploadFile({
        url: requestService.getUploadUrl(),
        filePath: obj.data.file,
        name: "file",
        formData: {
            groupCode: obj.data.groupCode
        },
        success: (res) => {
            console.log(res, "上传文件返回结果");
            let json = JSON.parse(res.data);
            console.log(json, "上传文件返回结果");
            if (json.success) {
                obj.stateSuccess(json);
                return;
            }
            if (json.stateCode === 'notLogin') {
                uni.navigateTo({
                    url: "/pages/login/login"
                });
            }
            obj.stateFail(json);
        },
        fail: (err) => {
            obj.stateFail(err);
        }
    });
    // #endif

}

export default result;