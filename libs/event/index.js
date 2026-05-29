import storage from "../storage";
import util from "../util";

let result = {};

/**
 * 初始化
 */
result.init = () => {
    result.emitCount = storage.get("eventEvent:emitCount") || 0;
    // 保持同步
    result.onCount = result.emitCount;
}

/**
 * 发送时间的次数
 */
result.emitCount = 0;

/**
 * 接收事件的次数
 */
result.onCount = 0;

/**
 * 事件队列
 */
result.queue = [];

/**
 * 获取事件队列
 */
result.getQueue = function () {
    // result.queue = storage.get("eventEvent:queue") || [];
    // return result.queue;
    // 获取所有"eventEvent:queue:"开头的key
    // result.clearQueue();
    let keys = storage.getKeysByPrefix("eventEvent:queue:");
    result.queue = [];
    for (let i = 0; i < keys.length; i++) {
        result.queue.push(storage.get(keys[i]));
    }
    return result.queue;
}

/**
 * 事件队列
 */
result.queueAdd = function (emitEvent) {
    let uuid = util.generateUUID();
    result.getQueue();
    storage.set("eventEvent:queue:"+uuid, emitEvent, 1000 * 5);
}

/**
 * 清空队列
 */
result.clearQueue = function () {
    // storage.remove("eventEvent:queue:"+result.uuid);
    // result.getQueue();
    storage.clearByEx();
}

/**
 * 添加进队列
 */
result.addQueue = function (lastEmitEvent) {
    if (storage.isLock("eventEvent:queueHandle")) {
        console.log("eventEvent:queueHandle is lock");
        setTimeout(() => {
            result.queueAdd(lastEmitEvent);
        }, 20);
        return;
    }

    result.emitCount = storage.get("eventEvent:emitCount") || 0;
    result.emitCount++;
    // 保存发送事件的次数
    storage.set("eventEvent:emitCount", result.emitCount, 1000 * 60 * 60 * 24);
    result.queueAdd(lastEmitEvent);
}

/**
 * 队列处理
 * 此处将会放在统一定时器中处理
 */
result.queueHandle = function () {
    let lockKey = "eventEvent:queueHandle";
    // 加锁
    storage.addLock(lockKey);
    result.emitCount = storage.get("eventEvent:emitCount") || 0;
    if (result.emitCount > result.onCount) {
        result.onCount = result.emitCount;
        let queue = result.getQueue();
        for (let i = 0; i < queue.length; i++) {
            if(!queue[i]||!queue[i].eventName){
                continue;
            }
            // console.log("KANTBOOT_EVENT:"+queue[i].eventName, queue[i].data);
            uni.$emit("KANTBOOT_EVENT:"+queue[i].eventName, queue[i].data);
        }
        // 清空队列
        result.clearQueue();
    }

    // 解锁
    storage.unlock(lockKey);
}


/**
 * 发送事件
 * @param eventName 事件名称
 * @param data 事件数据
 */
result.emit = function (eventName, data) {
    // result.addQueue({
    //     eventName: eventName,
    //     data: data
    // });
    uni.$emit("KANTBOOT_EVENT:"+eventName, data);
}


/**
 * 接收事件
 * @param eventName
 * @param callback
 */
result.on = function (eventName, callback) {
    uni.$on("KANTBOOT_EVENT:"+eventName, callback);
}

/**
 * 关闭事件
 */
result.off = function (eventName) {
    uni.$off("KANTBOOT_EVENT:" + eventName);
}

export default result;