import createStore from '../store/store'
import React from 'react'

const isServer = typeof window === 'undefined'; // 判断是不是windows环境

const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState) {
    if (isServer) {
        return createStore(initialState)  // 如果是服务端就生成新store
    }

    if (!window[__NEXT_REDUX_STORE__]) {
        window[__NEXT_REDUX_STORE__] = createStore(initialState)  // 单例模式，没有这个对象就创建这个对象
    }

    return window[__NEXT_REDUX_STORE__]
}

export default Comp => {
    class WithReduxApp extends React.Component {
        constructor(props) {
            super(props)
            this.reduxStore = getOrCreateStore(props.initialReduxState)
        }

        render() {
            const {Component, pageProps, ...rest} = this.props
            if (pageProps) {
                pageProps.test = '123'
            }
            return <Comp Component={Component} pageProps={pageProps} {...rest} reduxStore={this.reduxStore} />
        }
    }


    WithReduxApp.getInitialProps = async (ctx) => {
        let reduxStore;
        if(isServer){
            const {req} = ctx.ctx;
            const session = req.session;
            // 获取session

            if (session && session.userInfo) {
                // 如果用户信息存在就将userInfo设置进入store
                reduxStore = getOrCreateStore({
                    user:session.userInfo
                })
            }else{
                reduxStore = getOrCreateStore(); // 初始化的时候store里没要传入的值
            }
        }else{
            reduxStore = getOrCreateStore();
        }
        ctx.reduxStore = reduxStore;

        let appProps = {};
        if (typeof Comp.getInitialProps === 'function') {
            appProps = await Comp.getInitialProps(ctx)
        } // 等Comp的getInitialProps执行完得到的props返回回去


        return {
            ...appProps,
            initialReduxState: reduxStore.getState()
        }
    };

    return WithReduxApp
}