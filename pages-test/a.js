import { withRouter } from 'next/router'
import Head from 'next/head'
import styled from 'styled-components'
import dynamic from 'next/dynamic' // 异步加载组件
import getConfig from 'next/config'
// import moment from 'moment' // 如果一半的组件用到了moment，那么会提取出去作为公共的依赖

const Comp = dynamic(import ('../components/comp'));//只有在渲染的时候才会被真正的加载

const {serverRuntimeConfig,publicRuntimeConfig} = getConfig();

const Title = styled.h1`
    color:yellow;
    font-size:40px
`;

const A = ({router,name,time}) => {
    console.log("serverRuntimeConfig",serverRuntimeConfig);
    console.log("publicRuntimeConfig",publicRuntimeConfig);

    return (
        <>
            <Head>
                <title>
                    a页面
                </title>
            </Head>
            <Title>This is title{time}</Title>
            <Comp />
            <span>{router.query.id}{name}</span>;
            <a className='link'>123</a>
            <style jsx>{
                `a{
                color:blue;
            }
            .link{
                color:red;
            }`
            }</style>
            <style jsx global>
                {`
                a{
                    color:yellow
                }
            `}
            </style>
        </>
    )
}


A.getInitialProps = async() => { //nextjs机制是等getInitialProps加载完以后再执行组建的渲染

    const moment = await import('moment'); //当执行到这里的时候，再加载moment

    const promise = new Promise((resolve)=>{
        setTimeout(()=>{
            resolve({
                name:'MeSKiL',
                time:moment.default(Date.now()-60*1000).fromNow()
            })
        },1000)
    });
    return await promise
}; // 服务端和客户端同时执行，react复用服务端返回的html而不是重新生成一次,在服务端渲染的时候就可以直接拿到数据，渲染html。不需要客户端加载完js再去渲染
// 不能先渲染，后获取数据。与传统开发网站类似，跳转时，加载完数据后，再渲染网页。nextJs 是一个提供可以使用react开发传统网站的功能，兼具传统网站和新网站webapp的优势。

export default withRouter(A) //把一些拿到的参数传给A组件