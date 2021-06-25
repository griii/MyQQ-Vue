module.exports = {
    outputDir: 'dist',   //build输出目录
    assetsDir: 'assets', //静态资源目录（js, css, img）
    lintOnSave: false, //是否开启eslint
    devServer: {
        proxy: {
            'http://www.guoruijava.xyz/api': {
              target: 'http://www.guoruijava.xyz/api',  //目标接口域名
              changeOrigin: true,  //是否跨域
              pathRewrite: {
                '^/api': '/api'   //重写接口 后台接口指向不统一  所以指向所有/
              }
            },
        },
        open: false, //是否自动弹出浏览器页面
        host: "localhost", 
        port: '8081', 
        https: false,   //是否使用https协议
        hotOnly: true, //是否开启热更新
        
    },
    chainWebpack: config => {
        // 修复HMR
        config.resolve.symlinks(true);
    }
}