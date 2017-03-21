// 服务是被new出来的
// 需要listen一个端口

const http = require('http')
const Ctx = require('./ctx')

class Woa {
    constructor(){
        this.dispatch = async (ctx, next) => {
            console.log('我是最内层')
            if (next) {
                await next()
            }
        }
        this.MWS = []
    }
    handle(ctx){
        // 每次http请求，都需要重新生成一个dispatch，因为其对ctx的强依赖
        let dispatch = this.dispatch
        ;[...this.MWS].reverse().forEach(mdw => {
            dispatch = mdw.bind(null, ctx , dispatch)
        })

        dispatch()
    }
    /**
     * 当一个http请求进来的时候，我们需要像洋葱一样对请求进行处理
     */
    use (...arr) {
        this.MWS.push(...arr)
        return this
    }
    listen(PORT, callback){
        http.createServer((request, response)=>{
            try {
                this.handle(new Ctx(request, response))
            } catch (err) {
                console.log(err)
            }
        }).listen(PORT, ()=>{
            callback && callback(PORT)
        })
    }
}

module.exports = Woa
