import WithRepoBasic from '../../components/with-repo-basic'
import api from '../../lib/api'
import dynamic from 'next/dynamic'

const MDRenderer = dynamic( () => import('../../components/MarkdownRenderer'),{
    loading:()=><p>Loading</p>
}); // 异步加载,单独打包出js，不改变则hash不变，可以长缓存
// 加载时返回loading

function Detail({readme}) {
    return <MDRenderer content={readme.content} isBase64={true} />
}

Detail.getInitialProps = async ({ctx: {query: {owner, name}, req, res}}) => {

    const readmeRes = await api.request({
        url: `/repos/${owner}/${name}/readme`
    }, req, res);

    return {
        readme: readmeRes.data
    }
};

export default WithRepoBasic(Detail, 'index')