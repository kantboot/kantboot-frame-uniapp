import storage from "../storage";
import i18n from "../i18n";
import requestConfig from "./request.config";
import style from "../style";
import result from "../request/request.no.security";
import location from "../location";

let config = {
    requestConfig,
};

/**
 * 校验参数
 */
let check = function (obj) {
    if (!obj.data) {
        obj.data = {};
    }
    if (!obj.header) {
        obj.header = {};
    }
    if (!obj.isReconnect) {
        obj.isReconnect = false;
    }
    if (!obj.isReconnectState) {
        obj.isReconnectState = false
    }
    // 是否会跳转登录
    if (obj.isJumpLogin == null) {
        obj.isJumpLogin = true;
    }
    return obj;
}

/**
 * 获取请求的url
 * @param obj 请求的参数
 */
let getUrl = function (obj) {
    let requestUrlPrefix = config.requestConfig.rootAddress;
    // 如果请求前缀末尾有斜杠，去掉
    if (requestUrlPrefix.endsWith("/")) {
        requestUrlPrefix = requestUrlPrefix.substring(0, requestUrlPrefix.length - 1);
    }
    // 如果请求的uri开头没有斜杠，加上
    if (!obj.uri.startsWith("/")) {
        obj.uri = "/" + obj.uri;
    }
    return requestUrlPrefix + obj.uri;
}


/**
 * 获取上传文件的路径
 */
let getUploadUrl = function () {
    let requestUrlPrefix = config.requestConfig.fileUploadAddress;
    // 如果请求前缀末尾有斜杠，去掉
    if (requestUrlPrefix.endsWith("/")) {
        requestUrlPrefix = requestUrlPrefix.substring(0, requestUrlPrefix.length - 1);
    }
    return requestUrlPrefix;
}

/**
 * 获取请求的数据
 * @param obj 请求的参数
 */
let getData = function (obj) {
    // 获取obj.data的所有参数
    let keys = Object.keys(obj.data);
    // 将keys按照字母排序
    keys.sort();
    let newData = {};
    // 将所有参数按照字母排序后，拼接成字符串
    for (let i = 0; i < keys.length; i++) {
        newData[keys[i]] = obj.data[keys[i]];
    }
    return newData;
}

/**
 * 获取请求的方法
 */
let getMethod = function (obj) {
    return obj.method || "POST";
}

/**
 * 获取场景
 */
 let getSceneCode = function () {
     return style.detectDeviceType();
}

/**
 * 设置token
 * @param token
 */
let setToken = (token) => {
    storage.set("token", token);
}

let getGeo = ()=>{
    let geo = location.getGeo();
    if(!geo){
        return "";
    }
    if(geo.latitude && geo.longitude){
        return geo.longitude + "," + geo.latitude;
    }
    return "";
}

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

/**
 * 获取token
 * @returns {string}
 */
let getToken = () => {
    // #ifdef H5
    // 获取url参数
    let token = getUrlParameter("token");
    if (token) {
        return token;
    }
    // #endif


    return storage.get("token");
}

/**
 * 获取header
 */
let getHeader = function (obj) {
    let contentType = obj.contentType || "application/json;charset=UTF-8";
    let token = getToken() || "";
    return {
        "content-type": contentType,
        "token": token,
        "languageCode": i18n.getLanguageCode(),
        "projectCode": requestConfig.projectCode || "",
        "sceneCode": getSceneCode(),
        "geo": getGeo(),
        ...obj.header
    };
}

let toStateSuccess = function (json, obj) {
    // 如果有状态码
    if (obj.stateSuccess) {
        obj.stateSuccess(json);
    }
}


let toStateFail = function (json, obj) {
    if(json?.stateCode==="notLogin"&&obj?.isJumpLogin){
        setTimeout(()=> {
            uni.navigateTo({
                url: "/pages/login/login"
            });
        },2000);
    }
    // 如果有状态码
    if (obj?.stateFail) {
        json.errMsg = i18n.zhToGlobal(json.errMsg);
        obj.stateFail(json);
    }
}


/**
 * 请求失败的处理
 */
let fail = function (res, obj) {

}

let getStatusMap = () => ({
    404: {
        stateCode: "notFound",
        errMsg: i18n.zhToGlobal("请求的资源不存在")
    },
    500: {
        stateCode: "serverError",
        errMsg: i18n.zhToGlobal("服务器错误")
    },
    502: {
        stateCode: "badGateway",
        errMsg: i18n.zhToGlobal("网关错误")
    },
})

let statusCodeToStateFail = function (statusCode) {
    return {
        ...getStatusMap()[statusCode],
        success: false
    }
}

/**
 * 请求完成的处理
 */
let complete = function (res, obj) {
    // 设置请求是否成功
    if (obj.getIsRequestOk) {
        obj.getIsRequestOk(!(res.errMsg === "request:fail"), res);
    }

    if (res.errMsg.startsWith("request:fail") && obj.isReconnectState) {
        return false;
    }

    if (res.errMsg.startsWith("request:fail") && !obj.isReconnect) {
        toStateFail({
            stateCode: "networkError",
            errMsg: "Network Error",
            success: false
        }, obj);
        return false;
    }

    // 如果请求成功，则不处理
    if (res.statusCode === 200) {
        // 获取请求到的数据
        let json = res.data;
        console.debug("请求成功", json);
        if (json.success) {
            toStateSuccess(json, obj);
            return false;
        }
        toStateFail(json,obj)
        return false;
    }

    // 获取请求到的数据
    let json = statusCodeToStateFail(res.statusCode, obj);

    toStateFail(json, obj);
}

/**
 * 是否前往断网重连
 * @param res 请求返回的数据
 * @param obj 请求的参数
 * @returns {boolean}
 */
let getIsToReconnect = function (res, obj) {
    return res.errMsg === "request:fail" && obj.isReconnect;
}

export default {
    setToken,
    getToken,
    check,
    getUrl,
    getData,
    getMethod,
    getHeader,
    toStateSuccess,
    toStateFail,
    fail,
    complete,
    getIsToReconnect,
    statusCodeToStateFail,
    getUploadUrl,
	getGeo
};
