import config from "./router.config";

let result = {};
result.config = config;

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
 * 获取完整路径
 * @param {string} path - 页面路径
 * @param {object} params - 参数
 * @returns {string} 完整路径
 */
result.getFullPath = function (path, params) {

    if (!path) {
        throw new Error("path(第1个参数)不能为空");
    }
    params = params || {};
    // #ifdef H5
    let token = getUrlParameter("token");
    if(token){
        params.token = token;
    }
    // #endif

    let paramStr = "";
    for (let key in params) {
        if(key==='token'){
            paramStr += `${key}=${params[key]}&`;
        }else if (params[key]) {
            paramStr += key + "=" + encodeURIComponent(params[key]) + "&";
        }
    }
    paramStr = paramStr.substring(0, paramStr.length - 1);
    // 路径拼接
    let fullPath = path + "";
    // 判断path中是否有参数
    if (fullPath.indexOf("?") === -1) {
        fullPath += "?";
    } else {
        fullPath += "&";
    }
    fullPath += paramStr;
    return fullPath;
}

/**
 * 前往跳转
 * @param {string} path - 页面路径
 * @param {object} params - 参数
 */
result.navTo = function (path, params) {
    let fullPath = this.getFullPath(path, params);
    uni.navigateTo({
        url: fullPath,
    })
}

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param {string} path - 页面路径
 * @param {object} params - 参数
 */
result.redirectTo = function (path, params) {
    let fullPath = this.getFullPath(path, params);
    uni.redirectTo({
        url: fullPath
    })
}

/**
 * 关闭所有页面，打开到应用内的某个页面
 * @param {string} path - 页面路径
 * @param {object} params - 参数
 */
result.reLaunch = function (path, params) {
    let fullPath = this.getFullPath(path, params);
    uni.reLaunch({
        url: fullPath
    })
}

/**
 * 返回上一页
 * @param {number} delta - 返回的页面数，如果 delta 大于现有页面数，则返回到首页。
 */
result.navBack = function (delta) {
    if (!delta) {
        delta = 1;
    }
    uni.navigateBack({
        delta
    });
}

/**
 * 前往WebView
 * @param {string} src - 页面路径
 * @param {object} data - 参数
 */
result.toWebview = function (src, data) {
    if (!src) {
        throw new Error("src(第1个参数)不能为空");
    }
    data = data || {
        // 传递的参数
        params: {},
        // 是否隐藏导航栏
        isHideNavBar: false,
        // 是否隐藏状态栏
        isHideStatusBar: false,
        // 标题
        title: "",
    };

    let params = data.params || {};
    for (let key in params) {
        if (params[key]) {
            src += (src.indexOf("?") === -1 ? "?" : "&") + key + "=" + encodeURIComponent(params[key]);
        }
    }
    src = encodeURIComponent(src);

    let paramStr = "";
    for (let key in data) {
        if (key !== "params") {
            paramStr += key + "=" + data[key] + "&";
        }
    }
    paramStr = paramStr.substring(0, paramStr.length - 1);

    uni.navigateTo({
        url: config.webViewPath+"?src=" + src + "&" + paramStr
    });
}

result.to = (code, path, params) => {
    if (!code) {
        result.navTo(path, params);
        return;
    }
    if (code === "navTo") {
        result.navTo(path, params);
        return;
    }
    if (code === "redirectTo") {
        result.redirectTo(path, params);
        return;
    }
    if (code === "reLaunch") {
        result.reLaunch(path, params);
    }
}

/**
 * 前往进入页面
 */
result.toInto = (code) => {
    // uni.navigateTo({
    //     url: config.intoPath
    // });
    result.to(code, config.intoPath);
}

/**
 * 前往登录页面
 */
result.toLogin = (code) => {
    // uni.navigateTo({
    //     url: config.loginPath
    // });
    result.to(code, config.loginPath);

}

/**
 * 前往首页
 */
result.toIndex = (code) => {
    // uni.navigateTo({
    //     url: config.indexPath
    // });
    result.to(code, config.indexPath);
}

/**
 * 前往语言选择
 */
result.toLanguageSelect = (code) => {
    // uni.navigateTo({
    //     url: config.languageSelectPath
    // });
    result.to(code, config.languageSelectPath);
}

/**
 * 前往设置页面
 */
result.toSetting = (code) => {
    // uni.navigateTo({
    //     url: config.settingPath
    // });
    result.to(code, config.settingPath);
}

/**
 * 前往颜色模式选择
 */
result.toColorModeSelect = (code) => {
    // uni.navigateTo({
    //     url: config.colorModeSelectPath
    // });
    result.to(code,config.colorModeSelectPath);
}

export default result;