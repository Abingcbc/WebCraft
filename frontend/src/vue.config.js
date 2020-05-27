import {domain} from "@/utils/Constraints";

module.exports = {
    //配置跨域请求
    devServer: {
        open: true,    //是否自动打开浏览器
        host: 'localhost',
        port: 8080,    //启动端口号
        https: false,    //是否开启https
        hotOnly: false,
        proxy: { // 配置跨域
            '/login': {
                target: domain+'/oauth/token',
                pathRewrite: {
                    '^/login': '/login'
                }
            },
            '/register': {
                target: domain+'/register',
                pathRewrite: {
                    '^/register': '/register'
                }
            },
            '/fileList': {
                target: domain+'/fileList',
                pathRewrite: {
                    '^/fileList': '/fileList'
                }
            }
        }
    },
};
