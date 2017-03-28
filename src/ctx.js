const URL = require('url').URL
const parse = require('./parse')

module.exports = class Ctx {
    constructor(req, res) {
        this.req = req
        this.res = res

        this.handleUrl()
        this.cookie = parse(req.headers.cookie, ';')

        this.request = {}

        this.__setCookieArr = []

        this.method = req.method.toUpperCase()

        // 响应
        Object.defineProperty(this, 'body', {
            set: (value) => {
                this.__setCookie()
                // 设置Head
                res.statusCode = 200

                const contentType = res.getHeader('content-type')
                if (!contentType) {
                    res.setHeader('content-type', this._getContentType('json'))
                }

                res.end(value)
            }
        })

        // 重定向
        Object.defineProperty(this, 'redirect', {
            set: (value) => {
                // 302临时重定向
                // 301永久重定向
                // 重定向的本质 还是server与client的数据交互
                // client接收到服务器的302状态码，然后去请求Location对应的地址
                this.__setCookie()
                res.writeHead(302, {'Location': value})
                res.end()
            }
        })
    }
    /**
     * [_getContentType 获取content-type]
     * @method _getContentType
     * @param  {String}        [type='json'] [description]
     * @return [type]                        [description]
     */
    _getContentType(type = 'json') {
        switch (type) {
            case 'json':
                return 'text/json;charset=utf-8'
            case 'html':
                return 'text/html;charset=utf-8'
            case 'plain':
                return 'text/plain;charset=utf-8'
            default:
                return 'text/json;charset=utf-8'
        }
    }
    /**
     * [send 响应请求]
     * @method send
     * @param  {String} [value='']    [description]
     * @param  {String} [type='json'] [description]
     * @return [type]                 [description]
     */
    send(value = '', type = 'json') {
        this.set('content-type', this._getContentType(type))
        this.body = value
    }
    /**
     * [jsonp 使用jsonp响应请求]
     * @method jsonp
     * @param  {String} [value=''] [response value]
     */
    jsonp(value = '') {
        let callback = this.query.callback
        let str = typeof value == 'object'
            ? JSON.stringify(value)
            : value

        if (callback) {
            this.set('content-type', this._getContentType('plain'))
            this.body = `${callback}(${str})`
        } else {
            this.body = str
        }
    }
    /**
     * [set 设置response header]
     * @method set
     * @param  {String} [key='']   [description]
     * @param  {String} [value=''] [description]
     */
    set(key = '', value = '') {
        // 处理响应头
        this.res.setHeader(key, value)
        return this
    }
    // 处理url相关
    handleUrl() {
        const {req} = this
        this.protocal = req.httpVersion == '1.1' ? 'http://' : 'https://'
        this.origin = this.protocal + req.headers.host + req.url

        const url = new URL(this.origin)

        this.hostname = url.hostname
        this.path = url.pathname
        this.searchParams = url.searchParams
        // url query
        this.query = {}
        url.searchParams.forEach((value, name, searchParams) => {
            this.query[name] = value
        });
        this.url = req.url
    }
    /**
     * [setCookie 设置cookie，然后在请求结束前响应]
     * @method setCookie
     * @param  {String}  [key='']     [description]
     * @param  {String}  [value='']   [description]
     * @param  {Number}  [maxAge=100] [description]
     * @param  {String}  [domain='']  [description]
     * @param  {String}  [path='/']   [description]
     */
    setCookie(key = '', value = '', maxAge = 100, domain = '', path = '/') {
        if (key && value) {
            let expires = new Date(Date.now() + maxAge * 1000).toUTCString()
            domain = domain || this.hostname

            let item = `${encodeURIComponent(key)}=${encodeURIComponent(value)};domain=${domain};path=${path};expires=${expires}`
            this.__setCookieArr.push(item)
        }
        return this
    }
    /**
     * [__setCookie 真正在response header里设置cookie]
     * @method __setCookie
     */
    __setCookie() {
        // 根据value 类型 及其长度来处理response
        const {res, __setCookieArr} = this
        // 设置cookie
        __setCookieArr.length && res.setHeader('Set-Cookie', __setCookieArr)
    }
}
