# woa
轻量级node web框架

## install

npm i woa --save

## introduce
- woa使用与koa相同的模式，即middleware来处理http请求，中间件先进后出
    中间件的应用在前端框架redux中也有应用
- woa使用async await处理异步任务

一个简单的中间件如下
```js
woa.use(async (ctx, next) => {
    console.log(ctx.cookie)
    await next()
})
```

middleware文件夹下有三个常用中间件
- favicon 处理网站icon
- router 如理接口请求
- static 处理静态资源

## issue
etc
