let result = {};

/**
 * 转换为常用时间格式
 * 时间戳转换为YY-MM-DD hh:mm:ss格式
 * @param time 时间戳
 * @returns {string} YY-MM-DD hh:mm:ss格式
 */
result.toCommonFormat = function (time) {
    //将时间戳格式转换成年月日时分秒
    let date = new Date(time);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';

    let h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + M + D + h + m + s;
};

/**
 * 格式转换（时间转格式）
 * @param time
 * @param formatStr
 * @returns {*}
 */
result.format = function (time, formatStr) {
    let date = new Date(parseInt(time));
    let Y = date.getFullYear();
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());

    let h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours());
    let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
    let s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    // 毫秒
    let S = (date.getMilliseconds() < 10 ? '00' + (date.getMilliseconds()) : (date.getMilliseconds() < 100 ? '0' + (date.getMilliseconds()) : date.getMilliseconds()));
    return formatStr
        .replace(/[yY]+/, Y)
        .replace(/M+/, M)
        .replace(/[Dd]+/, D)
        .replace(/[h]+/, h)
        .replace(/[m]+/, m)
        .replace(/[s]+/, s)
        .replace(/[S]+/, S);
}

/**
 * 格式转时间
 * @param {string} timeStr - 时间字符串
 * @param {string} formatStr - 格式字符串，如 "yyyy-MM-dd hh:mm:ss"
 * @returns {number} - 解析后的时间戳（毫秒级）
 */
result.parse = function (timeStr, formatStr) {
    let formatMap = {
        'yyyy': '(\\d{4})',  // 年
        'MM': '(\\d{1,2})',   // 月
        'dd': '(\\d{1,2})',   // 日
        'hh': '(\\d{1,2})',   // 时
        'mm': '(\\d{1,2})',   // 分
        'ss': '(\\d{1,2})'    // 秒
    };

    let dateParts = {};
    let regexPattern = formatStr.replace(/yyyy|MM|dd|hh|mm|ss/g, function (match) {
        return formatMap[match];
    });

    let regex = new RegExp(regexPattern);
    let matchResult = timeStr.match(regex);

    if (!matchResult) {
        throw new Error('时间字符串与格式不匹配');
    }

    let keys = Object.keys(formatMap);
    let index = 1;
    keys.forEach((key) => {
        if (formatStr.includes(key)) {
            dateParts[key] = parseInt(matchResult[index++]);
        }
    });

    let year = dateParts['yyyy'] || 1970;
    let month = (dateParts['MM'] || 1) - 1; // JS 的月份是 0~11
    let day = dateParts['dd'] || 1;
    let hour = dateParts['hh'] || 0;
    let minute = dateParts['mm'] || 0;
    let second = dateParts['ss'] || 0;

    return new Date(year, month, day, hour, minute, second).getTime();
};

/**
 * 可读模式时间
 * @param {*} dateTime 时间戳
 */
result.toReadable=function(dateTime) {

    // 获取当前时间戳
    let now = new Date().getTime();
    // 如果小于1分钟，显示刚刚
    if (now - dateTime < 60 * 1000) {
        return "刚刚";
    }

    // 如果大于1分钟，小于1小时，显示几分钟前
    if (now - dateTime < 60 * 60 * 1000) {
        // 获取相差的分钟数
        let minutes = Math.floor((now - dateTime) / (60 * 1000));

        return minutes+"分钟前";
    }
    // 获取今天的年月日和dateTime的年月日
    let nowDate = new Date(now);
    let dateTimeDate = new Date(dateTime);
    // 如果是同一天，显示hh:mm
    if (
        nowDate.getFullYear() === dateTimeDate.getFullYear() &&
        nowDate.getMonth() === dateTimeDate.getMonth() &&
        nowDate.getDate() === dateTimeDate.getDate()
    ) {
        return result.format(dateTime, "hh:mm");
    }
    // 如果是昨天，显示昨天 hh:mm（用时间差判断，避免跨月出错）
    if (Math.floor((now - dateTime) / (1000 * 60 * 60 * 24)) === 1) {
        return "昨天 " + result.format(dateTime, "hh:mm");
    }
    // 如果是今年，显示MM-dd hh:mm
    if (
        nowDate.getFullYear() === dateTimeDate.getFullYear() &&
        nowDate.getMonth() === dateTimeDate.getMonth()
    ) {
        return result.format(dateTime, "MM-dd hh:mm");
    }
    // 如果是去年，显示yyyy-MM-dd hh:mm
    return result.format(dateTime, "yyyy-MM-dd hh:mm");
}

/**
 * 根据出生日期获取年龄
 * @param {*} gmtBirthday 生日
 * @param {*} assumingNow 设定当前时间
 */
result.getAge = function (gmtBirthday,assumingNow) {
    if(!assumingNow){
        assumingNow = new Date().getTime();
    }
    let now = new Date(assumingNow);
    let birth = new Date(gmtBirthday);
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}



export default result;
