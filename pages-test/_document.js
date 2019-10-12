import Document, { Html,Head,Main,NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

class MyDocument extends Document { // 只有服务的渲染的时候才会被执行

    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try{
            ctx.renderPage = () => originalRenderPage({
                enhanceApp:App => (props) => sheet.collectStyles(<App {...props} />), //higher order Component
            });// 强化app以及对应组件的方式
            const props = await Document.getInitialProps(ctx);
            return {
                ...props,
                styles:<>{props.styles}{sheet.getStyleElement()}</>
            }
        }finally {
            sheet.seal()
        }

    } // 覆盖了原来的Document，所以要调用Document的getInitialProps。

    render() {
        return (
            <Html>
                <Head>
                    <style>{`.test{ color:red }`}</style>
                </Head>
                <body className='test'>
                    <Main />
                    <NextScript/>
                </body>
            </Html>
            )
    }
}

// 覆盖了就需要把必须的内容补上

export default MyDocument