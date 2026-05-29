import math from "./libs/math";
import util from "./libs/util";
import event from "./libs/event";
import request from "./libs/request";
import style from "./libs/style";
import i18n from "./libs/i18n";
import userAccount from "./libs/userAccount";
import file from "./libs/file";
import date from "./libs/date";
import location from "./libs/location";
import image from "./libs/image";
import router from "./libs/router";
import storage from "./libs/storage";

// 监听窗口变化（跨端安全）
const emitResize = () => {
  event.emit("window:resize");
};

let resizeTimer = null;

// #ifdef H5
if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(emitResize, 100);
  });
}
// #endif

// #ifndef H5
uni.onWindowResize(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(emitResize, 100);
});
// #endif


export default {
    math,
    util,
    event,
    request,
    style,
    i18n,
    userAccount,
    file,
    date,
    location,
    image,
    router,
    storage,
}