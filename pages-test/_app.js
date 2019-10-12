//覆盖next默认app.js
import App,{Container} from 'next/app' // 不需要覆盖默认的app.js只是为了增加css

import testHoc from '../lib/with-redux'

import { Provider } from 'react-redux'

import 'antd/dist/antd.css'

import MyContext from '../lib/my-context'

import Layout from '../components/Layout'

class MyApp extends App { //App上有许多nextJs封装的方法，所以要继承

    static async getInitialProps(ctx){ // 每一次页面切换都是可以调用的

        const { Component } = ctx;
        let pageProps = {};
        if(Component.getInitialProps){
            pageProps = await Component.getInitialProps(ctx); // ctx需要传递下去
        }
        return {
            pageProps
        }
    } // 重写_app.js时，getInitialProps就不会自动执行了，app里的getInitialProps可以获取到Component，返回Component的getInitialProps的返回值

    render(){
        const { Component,pageProps,reduxStore } = this.props; //对应的是具体的页面
        // console.log(Component);
        return (
            <Container>
                <Layout>
                    <Provider store={reduxStore}>
                        <MyContext.Provider value='test' >
                            <Component {...pageProps} />
                        </MyContext.Provider>
                    </Provider>
                </Layout>
            </Container>
        )
    }
}

export default testHoc(MyApp)