const Koa = require('koa');
const Router = require('koa-router');
const next = require('next');
const session = require('koa-session');
const Redis = require('ioredis');
const koaBody = require('koa-body');
const atob = require('atob');

const auth = require('./server/auth');
const api = require('./server/api');

const RedisSessionStore = require('./server/session-store');

const dev = process.env.NODE_ENV !== 'production';
const app = next({dev}); // 环境
const handle = app.getRequestHandler();

const redis = new Redis();

// 设置nodejs 全局atob

global.atob = atob;

app.prepare().then(() => {
    const server = new Koa();
    const router = new Router();

    server.keys = ['MeSKiL develop Github App'];

    server.use(koaBody()); // 可以通过ctx.request.body获取

    const SESSION_CONFIG = {
        key: 'cid',
        store:new RedisSessionStore(redis)
    };

    server.use(session(SESSION_CONFIG, server));

    auth(server);
    api(server); // 代理git api

    router.get('/a/:id', async (ctx) => {
        const id = ctx.params.id;
        await handle(ctx.req, ctx.res, {
            pathname: '/a',
            query: {id}
        });
        ctx.respond = false
    });

    router.get('/api/user/info', async (ctx) => {
        const user = ctx.session.userInfo;
        if(!user){
            ctx.status = 401;
            ctx.body = 'Need Login'
        }else{
            ctx.body = user;
            ctx.set('Content-Type','application/json')
        }
    });

    server.use(router.routes());

    server.use(async (ctx, next) => {
        ctx.req.session = ctx.session;
        await handle(ctx.req, ctx.res); //ctx.req ctx.res是nodejs原生的req和res对象，ctx.request ctx.response是koa的req和res对象 为了兼容next，所以要传原生的nodejs 对象
        ctx.respond = false
    });

    server.listen(3000, () => {
        console.log('koa server listening on 3000')
    })
});