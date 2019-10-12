async function test() {
    const Redis = require('ioredis');

    const redis = new Redis({
        port:6378,
        password:'yg5891822'
    });

    await redis.setex('c',10,124);
    const keys = await redis.keys('*');

    console.log( await redis.get('c'));
    setTimeout(async  ()=>{
        console.log( await redis.get('c'));
    },11000)
}

test();