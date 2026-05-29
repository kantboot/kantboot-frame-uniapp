import request from "../request";
import storage from "../storage";
import util from "../util";

let result = {};
let sysDictMap = {};

/** =========================
 *  内部工具：语言码规范化 & 候选降级
 *  - en-US -> en_US
 *  - en_US -> ["en_US","en"]
 *  - zh_CN -> ["zh_CN","zh"]
 * ========================= */
function normalizeLang(code) {
    if (!code) return "en_US";
    return String(code).replace(/-/g, "_");
}

function langCandidates(code) {
    code = normalizeLang(code);
    const short = code.split("_")[0];
    return short && short !== code ? [code, short] : [code];
}

/**
 * 获取当前语言编码
 * @returns {*} 语言编码
 */
result.getLanguageCode = function () {
    const cached = storage.get("languageCode");
    if (cached) return normalizeLang(cached);

    const info = uni.getSystemInfoSync ? uni.getSystemInfoSync() : {};
    let languageCode =
        info.osLanguage ||
        info.language ||
        (info.hostLanguage ? info.hostLanguage.split("-")[0] : "") ||
        "en-US";

    languageCode = normalizeLang(languageCode);
    return languageCode;
};

/**
 * 设置当前语言编码
 * @param languageCode 语言编码
 */
result.setLanguageCode = function (languageCode) {
    languageCode = normalizeLang(languageCode);

    // 是否存在语言本地化，如果存在就设置成语言本地化中的语言编码
    let dictI18nLocalizedMap = storage.get("dictI18nLocalizedMap");
    if (!dictI18nLocalizedMap) {
        storage.set("languageCode", languageCode);
        return;
    }

    // map key 也可能是 en-US/en_US 混的，两个都试
    const mapped =
        dictI18nLocalizedMap[languageCode] ||
        dictI18nLocalizedMap[String(languageCode).replace(/_/g, "-")] ||
        null;

    storage.set("languageCode", normalizeLang(mapped || languageCode));
};

/**
 * 获取语言本地化
 */
result.loadingLocalized = function () {
    return new Promise((resolve, reject) => {
        request.send({
            uri: "/system-language-web/language/getLocalizedList",
            stateSuccess: (res) => {
                console.debug("获取语言本地化成功", res.data);
                // 将语言本地化存储到本地
                storage.set("dictI18nLocalizedList", res.data);
                console.info("获取语言本地化", res.data);

                // 转换为map存储
                let dictI18nLocalizedMap = {};
                (res.data || []).forEach((item) => {
                    // item.code / item.languageCode 可能有 -/_，统一一下更稳
                    dictI18nLocalizedMap[normalizeLang(item.code)] = normalizeLang(item.languageCode);
                    // 也顺便存一份 "-" 版本，避免某些地方还在用 en-US
                    dictI18nLocalizedMap[String(item.code || "").replace(/_/g, "-")] = normalizeLang(item.languageCode);
                });

                storage.set("dictI18nLocalizedMap", dictI18nLocalizedMap);

                // 将当前系统语言通过 map 规范化后写入
                result.setLanguageCode(result.getLanguageCode());

                resolve(res.data);
            },
            stateFail: (res) => {
                reject(res);
            },
        });
    });
};

/**
 * 加载所有支持的语言
 */
result.loadingSupportLanguage = function () {
    return new Promise((resolve, reject) => {
        request.send({
            uri: "/system-language-web/language/getBySupport",
            stateSuccess: (res) => {
                console.debug("获取所有支持的语言成功", res.data);
                // 将所有支持的语言存储到本地
                storage.set("dictI18nSupportLanguageList", res.data);

                let languageMap = {};
                for (let i = 0; i < (res.data || []).length; i++) {
                    languageMap[normalizeLang(res.data[i].code)] = res.data[i].name;
                    // 同时给 - 版本也存一份（兜底）
                    languageMap[String(res.data[i].code || "").replace(/_/g, "-")] = res.data[i].name;
                }
                storage.set("dictI18nLanguageMap", languageMap);

                resolve(res.data);
            },
            stateFail: (res) => {
                reject(res);
            },
        });
    });
};

/**
 * 获取当前语言
 */
result.getLanguageName = function (languageCode) {
    if (!languageCode) languageCode = result.getLanguageCode();
    languageCode = normalizeLang(languageCode);

    try {
        let languageMap = storage.get("dictI18nLanguageMap") || {};
        return languageMap[languageCode] || languageMap[String(languageCode).replace(/_/g, "-")] || languageCode;
    } catch (e) {
        return languageCode;
    }
};

/**
 * 获取所有支持的语言
 */
result.getSupportLanguage = function () {
    return storage.get("dictI18nSupportLanguageList");
};

/**
 * 加载语言包
 */
result.loadLanguagePackage = function (dictGroupCode, languageCode) {
    // 如果languageCode为空，则获取当前语言编码
    if (!languageCode) languageCode = result.getLanguageCode();
    languageCode = normalizeLang(languageCode);

    // 根据dictI18nLocalizedMap获取语言编码
    let dictI18nLocalizedMap = storage.get("dictI18nLocalizedMap");
    if (!dictI18nLocalizedMap) {
        throw new Error("请先调用 loadingLocalized() 初始化语言包");
    }

    // ✅ 只有 map 命中才覆盖，避免变 undefined
    const mapped = dictI18nLocalizedMap[languageCode] || dictI18nLocalizedMap[String(languageCode).replace(/_/g, "-")];
    if (mapped) languageCode = normalizeLang(mapped);

    console.log("languageCode", languageCode);

    return new Promise((resolve, reject) => {
        request
            .post("/system-dict-web/dict/getDict", { data: { dictGroupCode } })
            .then((res) => {
                console.debug("加载字典包成功", res.data);

                // 放入缓存
                storage.set("SysDict", res.data);

                // 获取map
                let dictMap = {};
                (res.data || []).forEach((item) => {
                    let v = item.i18nSave || item;

                    // ✅ 兜底：有些后端会把 i18nSave 直接返回成 JSON 字符串
                    if (typeof v === "string") {
                        try {
                            v = JSON.parse(v);
                        } catch (e) {}
                    }

                    dictMap[item.code] = v;
                });

                storage.set("SysDictMap:" + dictGroupCode, dictMap);
                sysDictMap[dictGroupCode] = dictMap;

                // 加载中文全局
                let dictI18nZhToGlobal = {};
                // 加载英文全局
                let dictI18nEnToGlobal = {};

                for (let key in dictMap) {
                    const node = dictMap[key] || {};

                    // zh_CN / zh
                    try {
                        const v1 = node["zh_CN"]?.value;
                        if (v1) dictI18nZhToGlobal[v1] = key;
                    } catch (e) {}
                    try {
                        const v2 = node["zh"]?.value;
                        if (v2) dictI18nZhToGlobal[v2] = key;
                    } catch (e) {}

                    // en_US / en
                    try {
                        const v3 = node["en_US"]?.value;
                        if (v3) dictI18nEnToGlobal[v3] = key;
                    } catch (e) {}
                    try {
                        const v4 = node["en"]?.value;
                        if (v4) dictI18nEnToGlobal[v4] = key;
                    } catch (e) {}
                }

                storage.set("dictI18nZhToGlobal:" + dictGroupCode, dictI18nZhToGlobal);
                storage.set("dictI18nEnToGlobal:" + dictGroupCode, dictI18nEnToGlobal);

                resolve(dictMap);
            })
            .catch((err) => {
                console.debug("加载字典包失败", err);
                reject(err);
            });
    });
};

result.get = function (dictCode, dictGroupCode) {
    // 如果dictCode是json，那dictGroupCode就是json的key
    function isObject(val) {
        return Object.prototype.toString.call(val) === "[object Object]";
    }

    // ✅ 兼容：dictCode 直接传对象（例如某个实体带 i18nSave）
    if (isObject(dictCode)) {
        try {
            const keyName = dictGroupCode; // 你原逻辑：dictGroupCode 当 key 用
            const cand = langCandidates(result.getLanguageCode());

            for (const lc of cand) {
                const v = dictCode?.i18nSave?.[lc]?.[keyName];
                if (v !== undefined && v !== null && v !== "") return v;
            }

            return dictCode[keyName];
        } catch (e) {
            return dictCode[dictGroupCode];
        }
    }

    if (!dictGroupCode) dictGroupCode = "appFront";

    // ✅ 关键修复：刷新/重启后 sysDictMap 会丢，从 storage 回填
    if (!sysDictMap[dictGroupCode]) {
        const cached = storage.get("SysDictMap:" + dictGroupCode);
        if (cached) sysDictMap[dictGroupCode] = cached;
    }

    const group = sysDictMap[dictGroupCode];
    if (!group || !group[dictCode]) return dictCode;

    // ✅ 语言码候选：en_US -> en，zh_CN -> zh
    const cand = langCandidates(result.getLanguageCode());

    for (const lc of cand) {
        const node = group[dictCode]?.[lc];
        // 有些结构可能不是 {value}，做个兜底
        const v = node?.value ?? node;
        if (v !== undefined && v !== null && v !== "") return v;
    }

    return dictCode;
};

/**
 * 中文包转为全局
 * @param value 值
 * @param dictGroupCode 字典组编码
 * @returns {*}
 */
result.zhToGlobal = function (value, dictGroupCode) {
    if (!dictGroupCode) dictGroupCode = "appFront";
    try {
        let map = storage.get("dictI18nZhToGlobal:" + dictGroupCode) || {};
        let key = map[value];
        let newVar = result.get(key, dictGroupCode);
        return util.firstLetterUpper(newVar);
    } catch (e) {
        return value;
    }
};

/**
 * 英文包转全局
 * @param value 值
 * @param dictGroupCode 字典组编码
 */
result.enToGlobal = function (value, dictGroupCode) {
    if (!dictGroupCode) dictGroupCode = "appFront";
    try {
        let map = storage.get("dictI18nEnToGlobal:" + dictGroupCode) || {};
        let key = map[value];
        let newVar = result.get(key, dictGroupCode);
        return util.firstLetterUpper(newVar);
    } catch (e) {
        return util.firstLetterUpper(value);
    }
};

/**
 * 获取对应国际化的集合
 */
result.getI18n = (data) => {
    return new Promise((resolve, reject) => {
        let map = {};
        request.send({
            uri: "/system-language-web/languageI18n/getList",
            data: {
                ...data,
                languageCode: result.getLanguageCode(),
            },
            stateSuccess: (res) => {
                for (let i = 0; i < (res.data || []).length; i++) {
                    const item = res.data[i];
                    map[item.centerKey] = item;
                }
                console.debug("获取国际化成功", map);
                let resData = { list: res.data, map: map };
                resolve(resData);
            },
            stateFail: (res) => {
                console.debug("获取国际化失败", res);
                reject(res);
            },
        });
    });
};

export default result;
