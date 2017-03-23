
module.exports = class Router {
    constructor(){
        this.__routers = []
        ;['get', 'post', 'delete', 'put', 'all'].map(method => {
            // 还需处理的是
            this[method] = (path, ...plugins) => {
                this.__routers.push({
                    method,
                    path,
                    plugins: plugins.slice(0, -1),
                    callback: plugins[plugins.length - 1]
                })

                return this
            }
        })
    }
    /**
     * 检测url与路由是否匹配
     * 返回params
     */
    match(ctx, item){
        console.log(ctx.path, item.path, ctx.method , item.method)
        if (item.method != 'all' && ctx.method.toLowerCase() != item.method) return


        const urlArr = ctx.path.split('/')
        const itemArr = item.path.split('/')

        if (itemArr.length > urlArr.length) return
        if (itemArr.length < urlArr.length && itemArr[itemArr.length - 1] != '*') return

        let params = {}
        let match = itemArr.every((ele, index) => {
            if (index == itemArr.length - 1 && ele == '*') return true

            if (ele.startsWith(':')) {
                params[ele.slice(1)] = urlArr[index]
                return true
            } else {
                return ele === urlArr[index]
            }
        })

        return match && params
    }
    routers(){
        return async (ctx, next) => {
            let callback
            let plugins
            let fuck = this.__routers.some(item => {

                let params = this.match(ctx, item)

                if (params && item.callback) {
                    ctx.params = params
                    callback = item.callback
                    plugins = item.plugins
                    return true
                }
            })

            if (!fuck) {
                console.log(ctx.path, '没有匹配到')
                await next()
            } else {
                for (let i = 0 ; i < plugins.length ; i++) {
                    await plugins[i](ctx, next)
                }
                await callback(ctx, next)
            }
        }
    }
}
