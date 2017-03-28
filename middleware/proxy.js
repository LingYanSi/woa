let http = require('http')

export default function proxy(url, ctx) {
    url = require('url').parse(url)

    return new Promise(resolve => {
        var options = {
            port: url.port,
            hostname: url.hostname,
            method: ctx.method,
            path: decodeURIComponent(url.path + (url.search || '')) ,
            headers: ctx.req.headers
        };

        var req = http.request(options, res => {
            ctx.res.writeHead(res.statusCode, res.headers)
            // 目标服务器的response pipe 给client
            res.pipe(ctx.res)
        }).on('error', ()=>{
            ctx.body = `request error`
        })
        // 把client的reqeust body pipe 给目标服务器
        ctx.req.pipe(req);
    })
}
