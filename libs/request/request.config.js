let wsOrWss = "wss";
let httpOrHttps = "https";
let rootAddress = "api-frp.kantboot.com";


/**
 *  请求配置
 *  用于配置请求的根地址、响应数据字段、通用状态码、登录页面路径等
 *  该配置文件会被打包到项目中，不要在此文件中配置敏感信息
 */
const config = {

  /**
   * 根地址，用于配置请求的根地址，如：http://localhost:8889，
   * 注意：不要以“/”结尾，否则会导致请求地址错误
   *
   */
  rootAddress: `${httpOrHttps}://${rootAddress}`,
  fileAddress: `https://api-frp.kantboot.com/functional-file-web/file`,
  fileUploadAddress: `https://api-frp.kantboot.com/functional-file-web/file/upload`,


  /**
   * 根WebSocket地址，用于配置WebSocket请求的根地址，如：ws://localhost:8889，
   */
  websocketAddress: `${wsOrWss}://${rootAddress}/socket-websocket-web/socket`,

  /**
   * 项目编码，用于标识当前项目，由使用方在 main.js 中覆盖配置
   * 例如：kt.request.config.projectCode = "myProject"
   */
  projectCode: "",

  /**
   * 请求头字段
   */
  headerField: {
    /**
     * 权限字段
     * 用于配置权限字段，如：token
     * 使用此处为验证的token字段，默认为：token
     * 存储的key：
     *    如： authorization-token
     */
    authorization: "token",
  },

  /**
   * token存储字段，用于配置token存储的字段，如：token
   * 取消注释，表示不需要token存储的key
   */
  // tokenStorageKey: "token",

  /**
   * 响应数据字段
   */
  responseDataField: {
    stateCode: "stateCode", // 状态码字段
    stateSuccessMessage: "msg", // 状态为“成功”时的字段
    stateFailMessage: "errMsg", // 状态为“失败”时的字段
    bodyData: "data", //主体数据字段
  },

  /**
   * 通用状态码
   */
  stateCode: {
    /**
     * 成功状态码，用于配置请求成功的状态码，如：0
     */
    success: "SUCCESS",
    /**
     * 失败状态码，用于配置请求失败的状态码，如：-1
     */
    notLogin: "notLogin",
  }
};

export default config;
