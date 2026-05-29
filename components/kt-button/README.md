# 按钮组件

#### API

##### Props

| 参数            | 说明             | 类型    | 默认值 | 可选值                         |
| --------------- | ---------------- | ------- | ------ | ------------------------------ |
| common          | 几种通用的配色   | String  | black  | black \| red \| yellow \| blue |
| borderRadius    | 按钮弧度         | String  | 60rpx  | -                              |
| isOpenBoxShadow | 是否开启按钮阴影 | Boolean | true   | false \| true                  |



##### Methods

| 方法名称 | 说明             |
| -------- | ---------------- |
| loading  | 按钮进入等待状态 |
| error    | 按钮进入异常状态 |
| success  | 按钮进入成功状态 |

> 例

```html
<kt-button @click="toLoading()" ref="toLoadingBtn" common="black">登录</kt-button>
<kt-button @click="toError()" ref="blackBtn" common="black">登录</kt-button>
<kt-button @click="toSuccess()"ref="toSuccessBtn" common="black">登录</kt-button>
```

```js
methods:{
    toLoading(){
		this.$refs.toLoadingBtn.loading();
	},
	toError(){
		this.$refs.blackBtn.error("账号或密码错误");
	},
	toSuccess(){
		this.$refs.toSuccessBtn.success("登录成功");
	}
}			
```

扫码预览Demo

<div><img style="float:left" src="https://ui.uniapp.kantboot.com/md/kt-button/1.png"/></div>





