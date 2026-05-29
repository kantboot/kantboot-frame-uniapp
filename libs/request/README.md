# 网络请求工具(Request)

##### 配置

1、在main.js完成如下配置

```js
// main.js

import kt from '/uni_modules/kantboot/index-old.vue.js';

// 方式一：
// 更提倡以这种方式配置request
// 将以上的json存放进request.config.json中
// import requestConfig from 'request.config.json';
// kt.request.config = requestConfig

// 方式二（不推荐）：
// 注意：配置request 需要在`Vue.prototype.$kt=kt;`前执行
// start: 配置request 方式二（不推荐）

// start: 配置request
kt.request.config = {
	// 请求地址
	"rootAddress": "https://philosophy.kantboot.com",

	"headerField": {
		"token": "token" // 请求时在token的字段
	},

	// token存储的key
	"tokenStroageKey": "token",

	// 设置平台信息
	"platformCode": "KANTBOOT",

	// 响应数据字段
	"responseDataField": {
		"stateCode": "state", // 状态码字段
		"stateSuccessMessage": "msg", // 状态为“成功”时的消息字段
		"stateFalidMessage": "errMsg", // 状态为“失败”时的消息字段
		"bodyData": "data" //主体数据字段		
	},

	"stateCode": {
		"success": "2000", // 状态为“成功”时的状态码
		"notLogin": "-777" //	状态为“未登陆时”时的状态码
	},

	// 登录页面
	"loginPage": "/pages/thirdPartyLogin/thirdPartyLogin"

}
```

> 但是不建议 直接使用，推荐以下方式



##### 推荐方式

1、在根目录建立一个文件夹为api，并在api文件夹下创建index.js

<img src="https://ui.uniapp.kantboot.com/md/request/1.png"/>



2、在index.js中以如下格式填写api

```js
var api = {
		
	login:{
		/**
		 * 获取公开密钥B
		 */
		createPublicKey:{
			path:"system/thirdPartyLogin/createPublicKey",
			method:"post",
			contentType:"application/x-www-form-urlencoded",
		},
		/**
		 * 注册
		 */
		join:{
			path:"system/thirdPartyLogin/join",
			method:"post",
			contentType:"application/x-www-form-urlencoded",
		},
		/**
		 * 登录
		 */
		login:{
			path:"system/thirdPartyLogin/thirdPartyLogin",
			method:"post",
			contentType:"application/x-www-form-urlencoded",			
		},
		checkLoginStatus:{
			path:"system/thirdPartyLogin/checkLoginStatus",
			method:"post",
			contentType:"application/x-www-form-urlencoded"
		}
	}
};

export default api;
```

3、在main.js中引入

```js
// main.js

import api from '/api/index1.js';

Vue.prototype.$api=api;
```



4、使用

```html
<template>
	<view>
        <kt-input title="账号" placeholder="账号" v-model="requestParam.username"></kt-input>
		<kt-input title="密码" placeholder="密码" v-model="requestParam.password"></kt-input>
        <kt-button refs="submitBtn" @click="submit()">登录</kt-button>		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				requestParam:{
                    username:"",
                    password:""
                }
			}
		},
		methods: {
			submit(){
                // 此为演示案例，在实际开发中，建议使用公私钥加密的方式传输账号密码
                
				this.$kt.request.request({
					api:this.$api.login.login,
					stateSuccess: (res) => {
        				// 状态为“成功”时
                        this.$refs.submitBtn.success(res.msg);
                    },
					stateFail: (res) => {
        				// 状态为“失败”时
                        this.$refs.submitBtn.error(res.errMsg);
                    }});
			}
		}
	}
</script>

<style>

</style>

```



