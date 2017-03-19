const Woa = require('./src/index')
const woa = new Woa()
const favicon = require('./middleware/favicon')
const static = require('./middleware/static')
const Router = require('./middleware/router')

let router = new Router()

// 网站icon
woa.use(favicon('./favicon.ico'))

// 静态资源
woa.use(static(['./static/']))

// 路由控制
router.get('/fuck', async (ctx, next) => {
    ctx.body = 'fuck'
}).get('/fuck/:id/:b/*', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.params)
}).get('*', async (ctx, next) => {
    ctx.body = "favicon()"
})

woa.use(router.routers())

// 监听
woa.listen(8009, ()=>{
    // 服务启动成功
})
