import storage from "../storage";
import event from "../event";

let result = {};

result.setLocationStatus = (status)=>{
    storage.set("location:status", status);
}

result.getLocationStatus = ()=>{
    return storage.get("location:status");
}

result.setGeo = (geo)=>{
    storage.set("location:geo", geo);
}

result.getGeo = ()=>{
    return storage.get("location:geo");
}

result.getLocation = ()=>{
    // 判断是否超过1秒
    if(storage.get("location:timestamp") && storage.get("location:timestamp")+1000>Date.now()){
        return Promise.resolve(storage.get("location"));
    }

    // 获取当前时间戳，并存入缓存中
    storage.set("location:timestamp", Date.now());

    return new Promise((resolve, reject)=>{
        uni.getLocation({
            type: 'gcj02',
            success(res) {
                result.setGeo({
                    latitude: res.latitude,
                    longitude: res.longitude
                });
                event.emit("getLocation");
                storage.set("location", res);
                result.setLocationStatus("ok");
                resolve(res);
            },
            fail(err) {
                console.log("获取经纬度失败",err);
                if("getLocation:fail:auth"===err.errMsg){
                    result.setLocationStatus("authDenied");
                    reject({
                        code:"authDenied",
                    });
                }
                // if("getLocation:fail:auth deny"===err.errMsg){
                if((err.errMsg+"").indexOf("deny")!=-1){
                    result.setLocationStatus("authDenied");
                    reject({
                        code:"authDenied",
                    });
                }
                result.setLocationStatus("unknown");
                reject({
                    code:"unknown",
                });
            }
        })
    });
}

result.openGetLocation = ()=>{
    return new Promise((resolve, reject)=>{
        uni.authorize({
            scope: 'scope.userLocation',
            success () {
                // uni.showToast({
                //     title: '授权成功',
                // });
                // 用户已经同意小程序使用位置授权功能，后续调用 wx.startRecord 接口不会弹窗询问
                result.getLocation().then((res)=>{
                    resolve(res);
                }).catch((err)=>{
                    reject(err);
                });
            },
            fail (err) {
                console.log("授权失败",err);
                // if("authorize:fail:auth deny"===err.errMsg){
                if((err.errMsg+"").indexOf("deny")!=-1){
                    result.setLocationStatus("authDenied");
                    uni.showModal({
                        title: '提示',
                        content: '需要获取您的地理位置，请前往设置页面打开授权',
                        showCancel: true,
                        cancelText: "取消",
                        confirmText: "去设置",
                        success: function (res) {
                            if (res.confirm) {
                                uni.openSetting({
                                    success: function (res) {
                                        if(res.authSetting["scope.userLocation"]){
                                            storage.set("location:timestamp",null);
                                            // 用户重新同意了授权
                                            result.getLocation().then((res)=>{
                                                resolve(res);
                                            }).catch((err)=>{
                                                reject(err);
                                            });
                                        }else{
                                            result.setLocationStatus("authDenied");
                                            reject({
                                                code:"authDenied",
                                            });
                                        }
                                    },
                                    fail: function (err) {
                                        console.log(err);
                                        reject({
                                            code:"unknown",
                                        });
                                    }
                                });
                            } else if (res.cancel) {
                                result.setLocationStatus("authDenied");
                                reject({
                                    code:"authDenied",
                                });
                            }
                        }
                    });
                }else{
                    result.setLocationStatus("unknown");
                    reject({
                        code:"unknown",
                    });
                }
            }
        });
    });
}


export default result;