const webpack = require('webpack');
const withCss = require('@zeit/next-css');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const gitConfig = require('./config.sample');
const config = {
    distDir:'dist', // 编译文件的输出目录,没配置就在.next里
    generateEtags: true, // 是否给每个路由生成Etag，如果两次请求同一个页面的etag是相同的，浏览器就不请求内容，直接使用缓存,用nginx时可以关闭，因为nginx会有etags。
    onDemandEntries:{ // 页面内容缓存配置(用在开发时)
        maxInactiveAge: 25*1000, // 内容再内存中缓存的时长(ms)
        pagesBufferLength:2, // 同时缓存多少个页面
    },
    pageExtensions:['jsx','js'], // 在pages目录下哪些后缀的文件会被认为是页面，进行页面的编译
    generateBuildId: async () => { // 配置buildId
        if(process.env.YOUR_BUILD_ID){
            return process.env.YOUR_BUILD_ID
        }
        // 返回null使用默认的unique id
        return null
    }, // 当对同一个项目进行多个节点部署的时候会用到,不常用
    webpack(config,options){ // 手动修改webpack config
        return config
    },
    webpackDevMiddleware: config => { // 修改webpackDevMiddleware配置
        return config
    },
    env:{
        customKey:'value' // 可以在页面上通过process.env.customKey 获取 value
    },
    // 下面两个要通过 'next/config' 来读取
    serverRuntimeConfig: { // 只有在服务端渲染才会获取的配置
        mySecret:'secret',
        secondSecret:process.env.SECOND_SECRET,
    },
    publicRuntimeConfig:{    // 在服务端渲染和客户端渲染都可以获取的配置
        staticFolder:'/static'
    },
};


if(typeof require!=='undefined'){
    require.extensions['.css'] = file =>{}
} //如果require存在

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const SCOPE = 'user';


module.exports = withBundleAnalyzer(withCss({
    // distDir:'dist' 在这里配置
    // serverRuntimeConfig: {
    //     mySecret:'secret',
    //     secondSecret:process.env.SECOND_SECRET,
    // },
    webpack(config){
        config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/,/moment$/));
        return config
    },
    publicRuntimeConfig:{
        GITHUB_OAUTH_URL:gitConfig.GITHUB_OAUTH_URL,
        OAUTH_URL:gitConfig.OAUTH_URL
    },
    analyzeBrowser:['browser','both'].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig:{
        server:{
            analyzerMode:'static',
            reportFilename:'../bundles/server.html'
        },
        browser:{
            analyzerMode:'static',
            reportFilename:'../bundles/client.html'
        }
    }
}));