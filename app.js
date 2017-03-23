const Woa = require('./src/index')
const woa = new Woa()
const favicon = require('./middleware/favicon')
const static = require('./middleware/static')
const Router = require('./middleware/router')
const body = require('./middleware/body')

let router = new Router()

// 网站icon
woa.use(favicon('./favicon.ico'))

// 静态资源，但是从某种角度上来讲，静态资源应该交给cdn去处理
woa.use(static(['./static/'], {
    gzip: true
}))

// 路由控制
router
.get('/', async(ctx, next) => {
    ctx.set("content-type", "text/html;charset=utf-8")
    ctx.body =  `
        <div>
            <a href="/fuck">fuck</a>
            <a href="/images/1.jpg">图片</a>
        </div>
    `
})
.post('/fuck', body, async (ctx, next) => {
    console.log(ctx.request.body)
    // woa-router接受参数 path ...plugins handler
    ctx.fuck = "fuck 预处理"
}, async (ctx, next) => {
    ctx.body = ctx.fuck + 'fuck'
})
.get('/fuck/:id/:b/*', async (ctx, next) => {
    ctx.body = JSON.stringify(ctx.params)
})
.get('/redirect', async (ctx, next) => {
    ctx.setCookie('linianshun', '111')
    ctx.redirect = '/fuck'
})
.get('/jsonp', async (ctx, next) => {
    ctx.jsonp('hahah')
})
.all('*', async (ctx, next) => {
    ctx.body = "favicon()"
})

woa.use(router.routers())

// 监听
woa.listen(8009, (port)=>{
    // 服务启动成功
    console.log(`服务已启动, http://localhost:${port}`)
})
