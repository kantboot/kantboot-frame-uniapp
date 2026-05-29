import requestNoSecurity from "./request.no.security";
import requestConfig from "./request.config";

let result = {...requestNoSecurity};

result.config = requestConfig;

/**
 * post请求
 */
result.post = (uri, param) => {
    if(!param){
        param = {};
    }
    if(!param.data){
        param.data = {};
    }
    return new Promise((resolve, reject) => {
        result.send({
            method: "POST",
            uri,
            ...param,
            stateSuccess: (res) => {
                resolve(res);
            },
            stateFail: (err) => {
                reject(err);
            }
        });
    });
}

/**
 * get请求
 */
result.get = (uri, param) => {
    return new Promise((resolve, reject) => {
        result.send({
            method: "GET",
            uri,
            ...param,
            stateSuccess: (res) => {
                resolve(res);
            },
            stateFail: (err) => {
                reject(err);
            }
        });
    });
}

export default result;