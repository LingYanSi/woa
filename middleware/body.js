// 对于post请求，我们不处理文件上传，只接受formdata

module.exports = async (ctx, next) => {
    // 在这里读取post请求信息
    return new Promise((resolve, reject) => {
        const {req} = ctx
        let data = ''
        req.on('data', chunk => {
            data += chunk
        })

        req.on('end', chunk => {
            ctx.request.body = data
            resolve(data)
        })
    })
}
