module.exports = {
    // 使用eslint，建议规范
    "extends": "eslint:recommended",
    // 使用babel-eslint作为parser，可解决大部分es6/es7的关键字问题
    "parser": "babel-eslint",
    "plugins": [
        "standard",
        "promise",
        "import",
    ],
    "env": {
        "node": true,
        "es6": true,
    },
    rules: {
        // 无console
        "no-console": "off",
        // 未使用变量
        "no-unused-vars": "off",
        // 不允许func重新赋值
        "no-func-assign": "off",
        "no-duplicate-imports": ["error", { "includeExports": true }],
        "no-irregular-whitespace": "off"
    },
    // 关闭import export 错误
    "parserOptions": {
        "sourceType": "module",
    }
};
