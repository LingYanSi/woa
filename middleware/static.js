const fs = require('fs')
const path = require('path')
// 根据文件的后缀名，去判断文件类型，然后查表返回conten-type
const mime = require('mime-types')

/**
 * [exports 静态服务]
 * @method exports
 * @param  {String} [pre='/static/'] [description]
 * @param  {Array}  [dirArr=[]]      [description]
 * @return {[type]}                  [description]
 */
module.exports = function (dirArr = [], options) {
    let arr = []
    dirArr = dirArr.map(i => {
        let dir = path.resolve(process.cwd(), i)
        let dirs = fs.readdirSync(dir)
        arr.push(...dirs.map(item => {
            return {
                dirname: item,
                pathname: i
            }
        }))

        return dir
    })
    // 读取文件夹，然后去匹配

    return async (ctx, next) => {
        // if the method is not head or get
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
            return await next()
        }

        // 看看有没有匹配到路径前缀
        let fuck = ''
        let match = arr.some(item => {
            if (ctx.path.startsWith(`/${item.dirname}/`)) {
                fuck = item.pathname
                return true
            }
        })

        if (match) {
            try {
                let filepath = path.resolve(fuck, '.' + ctx.path)
                let STATS = fs.statSync(filepath)

                if (STATS.isFile()) {
                    let stream = fs.createReadStream(filepath)
                    let types = mime.lookup(filepath) || 'application/octet-stream'
                    ctx.response.setHeader('content-type', types)
                    ctx.response.setHeader('Last-Modified', new Date(STATS.mtime).toUTCString())
                    ctx.response.setHeader('Cache-Control', `max-age=10000`)
                    stream.pipe(ctx.response)
                } else {
                    ctx.body = 'file not exist'
                }
            } catch (err) {
                await next()
            }

        } else {
            await next()
        }

    }
}
