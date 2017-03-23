const fs = require('fs')
const path = require('path')
// 根据文件的后缀名，去判断文件类型，然后查表返回conten-type
const mime = require('mime-types')
const zlib = require('zlib')

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

    const useGzip = options.gzip
    const maxAge = options.maxAge || 0
    // 读取文件夹，然后去匹配

    return async (ctx, next) => {
        // if the method is not head or get
        if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
            return await next()
        }

        // 看看有没有匹配到路径前缀
        let matchedPathname = ''
        let match = arr.some(item => {
            if (ctx.path.startsWith(`/${item.dirname}/`)) {
                matchedPathname = item.pathname
                return true
            }
        })

        if (match) {
            try {
                let filepath = path.resolve(matchedPathname, '.' + ctx.path)
                let STATS = fs.statSync(filepath)

                if (STATS.isFile()) {
                    let types = mime.lookup(filepath) || 'application/octet-stream'
                    // 设置content-type
                    ctx.res.setHeader('content-type', types)
                    ctx.res.setHeader('Last-Modified', new Date(STATS.mtime).toUTCString())
                    // 设置缓存时间
                    ctx.res.setHeader('Cache-Control', `max-age=${maxAge}`)

                    let stream = fs.createReadStream(filepath)

                    // 是否开启gzip
                    if (useGzip) {
                        const gzip = zlib.createGzip();
                        ctx.res.setHeader('content-encoding', 'gzip')
                        stream.pipe(gzip).pipe(ctx.res)
                    } else {
                        stream.pipe(ctx.res)
                    }

                } else {
                    // 处理文件不存在
                    ctx.body = 'file not exist'
                }
            } catch (err) {
                console.log(err) 
                ctx.body = 'file not exist'
            }

        } else {
            await next()
        }

    }
}
