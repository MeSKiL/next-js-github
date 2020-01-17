const axios = require('axios');
const config = require('../config.sample');
const {request_token_url, client_id, client_secret} = config.github;

module.exports = (server) => {
    server.use(async (ctx, next) => {
        if (ctx.path === '/auth') {
            const code = ctx.query.code;
            if (!code) {
                ctx.body = 'code not exist';
                return
            }
            const res = await axios({
                method: 'POST',
                url: request_token_url,
                data: {
                    client_id,
                    client_secret,
                    code
                },
                headers: {
                    Accept: 'application/json'
                }
            });

            if (res.status === 200 && !(res.data && res.data.error)) {
                ctx.session.githubAuth = res.data;

                const {access_token, token_type} = res.data;

                const userInfoRes = await axios({
                    method: 'GET',
                    url: 'https://api.github.com/user',
                    headers: {
                        'Authorization': `${token_type} ${access_token}`
                    }
                });
                ctx.session.userInfo = userInfoRes.data;
                ctx.redirect((ctx.session&&ctx.session.urlBeforeOauth)||'/'); // 登录成功后跳转先前的页面或首页
                ctx.session.urlBeforeOauth = '' // 保存的url清空
            } else {
                ctx.body = `request token failed ${res.message}`
            }
        } else {
            await next();
        }
    });

    server.use(async (ctx, next) => {
        const path = ctx.path;
        const method = ctx.method;
        if(path === '/logout'&&method === 'POST'){
            ctx.session = null;
            ctx.body = `logout success`
        }else{
            await next();
        }
    })

    server.use(async (ctx,next)=>{
        const path = ctx.path;
        const method = ctx.method;
        if(path === '/prepare-auth'&&method === 'GET'){
            const {url} = ctx.query;
            ctx.session.urlBeforeOauth = url;
            // ctx.body = 'ready'
            ctx.redirect(config.OAUTH_URL)
        }else{
            await next();
        }
    })
};