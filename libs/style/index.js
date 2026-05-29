import storage from "../storage";
import event from "../event";

let result = {};

/**
 * 模式
 */
result.mode = {
    // 是否暗黑模式，auto: 自动，dark: 暗黑模式，light: 明亮模式
    colorScheme: "auto",
    // 设备模式（不根据系统返回，根据大小与宽高比例）， pc、pad、mobile，watch、tv
    device: 'pc',
    // 横屏还是竖屏，portrait:竖屏，landscape: 横屏
    orientation: 'portrait',
    // 根据字体大小，-1、0、1、2、3、4、5、6
    fontSize: '0',
    // 根据语言编码
    languageCode: 'zh_CN',
    /**
     * 宽度大小
     * xs <768px 响应式栅格数或者栅格属性对象
     * sm ≥768px 响应式栅格数或者栅格属性对象
     * md ≥992px 响应式栅格数或者栅格属性对象
     * lg ≥1200px 响应式栅格数或者栅格属性对象
     * xl ≥1920px 响应式栅格数或者栅格属性对象
     */
    widthSize: []
};

result.modeCreateOn = (callback) => {
    callback();
    event.on('kantboot:style:create', ()=>{
        callback();
    });
}
result.modeCreateEmit = () => {
    console.log('emit kantboot:style:create');
    event.emit('kantboot:style:create', {});
}


result.getMode = function () {
    let modeStorage = storage.get("kantboot:style:mode");
    if (modeStorage) {
        result.mode = modeStorage;

        return result.mode;
    } else {
        // 设置默认值
        storage.set("kantboot:style:mode", result.mode);

        return result.mode;
    }
}

result.setMode = function (mode) {
    storage.set("kantboot:style:mode", mode);
    result.modeCreateEmit();

    return result.mode;
}

/**
 * 获取颜色模式
 */
result.getColorScheme = function () {
    let mode = result.getMode();
    return mode.colorScheme;
}

result.getInnerWidth = () => {
    const systemInfo = uni.getSystemInfoSync();
    return  systemInfo.windowWidth;
}

/**
 * 设置颜色模式
 */
result.setColorScheme = function (colorScheme) {
    let mode = result.getMode();
    mode.colorScheme = colorScheme;
    result.setMode(mode);
    return mode;
}

result.detectDeviceType = () => {
    // 使用 innerWidth 替代 screen.width
    const viewportWidth = result.getInnerWidth();

    if (viewportWidth < 768) return 'mobile';
    if (viewportWidth < 992) return 'pad';
    return 'pc';
}

result.getWidthSizes = function () {
    let list = [];
    // 使用 innerWidth 替代 screen.width
    const viewportWidth = result.getInnerWidth();

    if (viewportWidth < 768) {
        list.push('xs');
    }
    if (viewportWidth >= 768) {
        list.push('sm');
    }
    if (viewportWidth >= 992) {
        list.push('md');
    }
    if (viewportWidth >= 1200) {
        list.push('lg');
    }
    if (viewportWidth >= 1920) {
        list.push('xl');
    }
    return list;
}

result.getWidthSize = function () {
    // 使用 innerWidth 替代 screen.width
    const viewportWidth = result.getInnerWidth();

    if (viewportWidth >= 1920) return 'xl';
    if (viewportWidth >= 1200) return 'lg';
    if (viewportWidth >= 992)  return 'md';
    if (viewportWidth >= 768)  return 'sm';
    return 'xs';
}


result.getColorSchemeType = function (colorScheme) {
    if (colorScheme === undefined || colorScheme === "auto") {
        // #ifdef H5
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        // #endif
        // #ifndef H5
        return 'light';
        // #endif
    }
    return colorScheme;
}

result.toggleClass = function (...clazz) {

    let mode = result.getMode();

    let classNameList1 = clazz;
    let classNameList2 = [];
    // 根据暗黑模式来决定是否添加夜间模式的类名
    classNameList2 = clazz.map(item => {
        return item + '-mode-color-scheme-' + result.getColorSchemeType(mode.colorScheme)
    });

    // 根据设备模式添加设备模式的类名
    let classNameList3 = [];
    classNameList3 = clazz.map(item => {
        // console.log('result.detectDeviceType()', result.detectDeviceType());
        return item + '-mode-device-' + result.detectDeviceType();

    });

    let classNameList4 = [];
    // 根据横屏还是竖屏添加横屏或者竖屏的类名
    if (mode.orientation) {
        classNameList4 = clazz.map(item => {
            return item + '-mode-orientation-' + mode.orientation
        });
    }

    // 根据文字大小添加类名
    let classNameList5 = clazz.map(item => {
        return item + '-mode-font-size-' + mode.fontSize
    });

    // 根据语言编码添加类名
    let classNameList6 = clazz.map(item => {
        return item + '-mode-language-code-' + mode.languageCode
    });

    // 根据宽度大小添加语言编码
    let classNameList7 = clazz.map(item => {
        let widthSize = result.getWidthSize();
        item = item + '-mode-width-size-' + widthSize;
        return item;
    });


    // let classNameList = classNameList1 + ' ' + classNameList2 + ' ' + classNameList3 + ' ' + classNameList4 + ' ' + classNameList5;
    // classNameList = classNameList.replace(/\s+/g, ' ').trim();
    // return classNameList;
    let map = {};
    for (let i = 0; i < clazz.length; i++) {
        let item = clazz[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList1.length; i++) {
        let item = classNameList1[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList2.length; i++) {
        let item = classNameList2[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList3.length; i++) {
        let item = classNameList3[i];
        // console.log('item----', item);
        map[item] = true;
    }
    for (let i = 0; i < classNameList4.length; i++) {
        let item = classNameList4[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList5.length; i++) {
        let item = classNameList5[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList6.length; i++) {
        let item = classNameList6[i];
        map[item] = true;
    }
    for (let i = 0; i < classNameList7.length; i++) {
        let item = classNameList7[i];
        map[item] = true;
    }
    return Object.keys(map).join(' ');
}

/**
 * 根据字体大小，返回一个计算后的值
 */
result.toggleFontSize = (fontSize) => {
    let mode = result.getMode();
    // 比例对应
    let ratio = {
        '-1': 0.8,
        '0': 1,
        '1': 1.2,
        '2': 1.4,
        '3': 1.6,
        '4': 1.8,
        '5': 2,
        '6': 2.2
    }
    return `calc(${ratio[fontSize]} * ${ratio[mode.fontSize + '']})`;
}

/**
 * 根据颜色，返回一个计算后的值
 */
result.toggleColor = (color) => {
    let mode = result.mode;
    if (!mode.dark) {
        return color;
    }
}

export default result;