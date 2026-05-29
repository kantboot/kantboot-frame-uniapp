import request from "../request";
import storage from "../storage";
import event from "../event";
import location from "../location";

let result = {};

result.requestSelf = ()=> {
    // 获取用户自身信息
    return new Promise((resolve, reject) => {
        // location.getLocation();
        console.log("123")

        request.send({
            // 检测到未登录，不自动跳转登录页
            isJumpLogin:false,
            uri: "/user-account-web/userAccount/getSelf",
            stateSuccess: (res) => {
                console.debug("获取用户自身信息成功", res);
                // 保存用户信息到缓存
                storage.set("userAccount:self", res.data);
                // 设置成已登录
                storage.set("userAccount:isLogin", true);
                event.emit("userAccount:getSelf", res.data);
                resolve(res);
            },
            stateFail: (res) => {
                if(res?.stateCode==="notLogin"){
                    // 删除用户信息
                    storage.remove("userAccount:self");
                    // 设置成未登录
                    storage.set("userAccount:isLogin", false);
                }
                // 如果网络错误
                if(res?.stateCode==="networkError"){
                }

                reject(res);
            }
        })
    });
}

result.getSelf = ()=> {
    return new Promise((resolve, reject) => {
        // 先从缓存中获取
        let userAccount = storage.get("userAccount:self");
        if(userAccount){
            resolve(userAccount);
            return;
        }
        // 如果没有，则请求
        result.requestSelf().then((res)=>{
            console.log("请求用户自身信息", res)
            resolve(res.data);
        }).catch((res)=>{
            reject(res);
        });
    });
}


result.requestById = (userAccountId)=> {
    // 获取用户信息
    return new Promise((resolve, reject) => {
        request.send({
            uri: "/user-account-web/userAccount/getById",
            data: {
                id: userAccountId
            },
            stateSuccess: (res) => {
                console.debug("获取用户信息成功", res);
                // 存入缓存中
                storage.setEx("userAccount:getById:"+res.data.id, res.data,1000*60*20);
                resolve(res.data);
            },
            stateFail: (res) => {
                console.log(res,"err")
                // 如果网络错误
                if(res?.stateCode==="networkError"){
                }
                reject(res);
            }
        })
    });
}

result.getById = (userAccountId)=> {
    return new Promise((resolve, reject) => {
        // 先从缓存中获取
        let userAccount = storage.get("userAccount:getById:"+userAccountId);
        if(userAccount){
            resolve(userAccount);
            return;
        }
        // 如果没有，则请求
        result.requestById(userAccountId).then((res)=>{
            console.log("请求用户信息", res)
            resolve(res);
        }).catch((res)=>{
            reject(res);
        });
    });
}

result.setLogin = (loginVO)=> {
    request.setToken(loginVO.token);
    event.emit("loginSuccess");
    // 保存用户信息到缓存
    storage.set("userAccount:self", loginVO.userAccount);
}

/**
 * 退出登录
 * @returns {Promise<unknown>}
 */
result.logout=()=> {
    return new Promise((resolve, reject) => {
        // 调用登出接口
        request.post("/user-account-web/userAccountLogin/logout").then((res)=>{
            resolve(res);
        }).catch((err)=>{
            // 即使登出接口调用失败，也清除缓存
            resolve(err);
        }).finally(()=>{
            // 清除token
            request.setToken(null);
            // 删除用户信息
            storage.remove("userAccount:self");
            // 设置成未登录
            storage.set("userAccount:isLogin", false);
            event.emit("logout");
        });
    });
}
export default result;