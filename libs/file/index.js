import fileConfig from "./file.config";

let config = fileConfig;

/**
 * 根据文件id访问文件
 */
let visit = function (id) {
    return `${config.visitFileAddress}?id=${id}`;
}

/**
 * 根据文件路径访问文件
 * @param {Object} path 文件路径
 * @return string 文件的url
 */
let byPath = function (path) {
    return `${config.staticFileAddress}/${path}`;
}

/**
 * 选择文件
 */
let select = function () {
}

export default {
    config,
    visit,
    byPath,
}
