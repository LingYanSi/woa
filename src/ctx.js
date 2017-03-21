const URL = require('url').URL;
const parse = require('./parse')

// const header =  { host:                      'localhost:8009',
//   connection:                  'keep-alive',
//   pragma:                      'no-cache',
//   'cache-control':             'no-cache',
//   'upgrade-insecure-requests': '1',
//   'user-agent':                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.98 S
// afari/537.36',
//   accept:                      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//   'accept-encoding':           'gzip, deflate, sdch, br',
//   'accept-language':           'en,ja;q=0.8,ko;q=0.6,zh-TW;q=0.4,zh;q=0.2,zh-CN;q=0.2',
//   cookie:                      'cid=90676390-0a6c-11e7-b5de-ff4a3e9e5b11; aa=å®å°å¡' }

module.exports = class Ctx {
    constructor(req, res) {
        this.req = req
        this.res = res

        this.handleUrl()
        this.cookie = parse(req.headers.cookie, ';')

        this.request = {}

        this.__setCookieArr = []

        this.method = req.method.toUpperCase()

        Object.defineProperty(this, 'body', {
            set: (value) => {
                // 根据value 类型 及其长度来处理response
                const {res, __setCookieArr} = this
                // 设置cookie
                __setCookieArr.length && res.setHeader('Set-Cookie', __setCookieArr)

                // 设置Head
                res.statusCode = 200

                const contentType = res.getHeader('content-type')
                if (!contentType) {
                    res.setHeader('content-type', 'text/json;charset=utf-8')
                }

                res.end(value)
            }
        })
    }
    set(key, value){
        // 处理响应头
        this.res.setHeader(key, value)
    }
    // 处理url相关
    handleUrl(){
        const {req} = this
        this.protocal = req.httpVersion == '1.1' ? 'http://' : 'https://'
        this.origin = this.protocal + req.headers.host + req.url
        const url = new URL(this.origin)

        this.hostname = url.hostname
        this.path = url.pathname
        this.query = url.searchParams
        this.url = req.url
    }
    // 设置cookie，然后在请求结束前响应
    setCookie(key, value, maxAge = 100, domain = '', path='/') {
        let expires = new Date(Date.now() + maxAge * 1000).toUTCString()
        domain = domain || this.hostname

        let item = `${encodeURIComponent(key)}=${encodeURIComponent(value)};domain=${domain};path=${path};expires=${expires}`
        this.__setCookieArr.push(item)
    }
}
