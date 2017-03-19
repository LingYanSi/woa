function parse (str = '', splitKey = '&') {
    let obj = {}
    str.split(splitKey).map(item => {
        const [key, value] = item.split('=').map(decodeURIComponent).map(i => i.trim())
        if (key) {
            obj[key] = value
        }
    })
    return obj
}

module.exports = parse
