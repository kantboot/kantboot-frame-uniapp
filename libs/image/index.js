import util from "../util/index.js";
import router from "../router";
import event from "../event";

let result = {};

/**
 * 前往图片裁剪
 */
result.toImageClip = (imgSrc,width,height) => {
    // 生成UUID
    let uuid = util.generateUUID(64);
    let params = {
        imgSrc,
        width,
        height,
        uuid
    };
    router.navTo("/pages/kt-pages/image-cropper/image-cropper",params);
    return new Promise((resolve,reject) => {
        event.on(uuid,(data) => {
            console.log("imageClip",data);
            event.off(uuid);
            resolve(data);
        });
    });
}

export default result;

