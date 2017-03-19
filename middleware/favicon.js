const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

module.exports = function (pathname) {
    const filepath = path.resolve(process.cwd(), pathname)

    return async (ctx, next) => {
        if (ctx.path == '/favicon.ico') {
            let types = mime.lookup(filepath) || 'application/octet-stream'
            ctx.response.setHeader('content-type', types)

            fs.createReadStream(filepath).pipe(ctx.response)
        } else {
            await next()
        }
    }
}
