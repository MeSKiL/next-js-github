import {useEffect} from 'react'
import {Button, Icon, Tabs} from 'antd'

const api = require('../lib/api');
import {connect} from 'react-redux';
import Router, {withRouter} from 'next/router'
import LRU from 'lru-cache'

import Repo from '../components/Repo'

const cache = new LRU({
    maxAge: 1000 * 60 * 10
});

import getConfig from "next/config";
import {cacheArray} from "../lib/repo-basic-cache";

const {publicRuntimeConfig} = getConfig();

const isServer = typeof window === 'undefined';

function Index({userRepos, userStaredRepos, user, router}) {
    const tabKey = router.query.key || '1';

    const handleTabChange = (activeKey) => {
        Router.push(`/?key=${activeKey}`)
    };
    useEffect(() => {
        if (!isServer) {
            // LRU cache 10分钟内不使用数据，就清除
            if (userRepos && userStaredRepos) {
                cache.set('userRepos', userRepos);
                cache.set('userStaredRepos', userStaredRepos);
            }
        }
    }, [userRepos, userStaredRepos]); // 作为依赖，依赖改变时，触发useEffect

    useEffect(() => {
        if (!isServer) {
            cacheArray(userRepos);
            cacheArray(userStaredRepos)
        }
    }); // detail reposBasic的缓存

    if (!user || !user.id) {
        return <div className="root">
            <p>亲，您还没有登陆哦~</p>
            <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>点击登陆</Button>
            <style jsx>{`
                .root{
                    height:400px;
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                    align-items:center;
                }
            `}</style>
        </div>
    }
    return (
        <div className="root">
            <div className="user-info">
                <img src={user.avatar_url} alt="user avatar" className="avatar" />
                <span className="login">{user.login}</span>
                <span className="name">{user.name}</span>
                <span className="bio">{user.bio}</span>
                <p className="email">
                    <Icon type="mail" style={{marginRight: 10}} />
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                </p>
            </div>
            <div className="user-repos">
                <div className="user-repos">

                    <Tabs activeKey={tabKey} onChange={handleTabChange} animated={false}>
                        <Tabs.TabPane tab="你的仓库" key="1">
                            {
                                userRepos.map(repo =>
                                    <Repo repo={repo} key={repo.id} />
                                )
                            }
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="你关注的仓库" key="2">
                            {
                                userStaredRepos.map(repo =>
                                    <Repo repo={repo} key={repo.id} />
                                )
                            }
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
            <style jsx>{`
                    .root{
                        display:flex;
                        align-items:flex-start;
                        padding:20px 0;
                    }
                    .user-info{
                        width:200px;
                        margin-right:40px;
                        flex-shrink:0;
                        display:flex;
                        flex-direction:column;
                    }
                    .login{
                        font-weight:800;
                        font-size:20px;
                        margin-top:20px;
                    }
                    .name{
                        font-size:16px;
                        color:#777;
                    }
                    .bio{
                        margin-top:20px;
                        co;lor:#333;
                    }
                    .avatar{
                        width:100%;
                        border-radius:5px;
                    }
                    .user-repos{
                        flex-grow:1;
                    }
                `}</style>
        </div>
    )
}


Index.getInitialProps = async ({ctx, reduxStore}) => {
    const user = reduxStore.getState().user;
    if (!user || !user.id) {
        return {}
    }

    if (!isServer) {
        if (cache.get('userRepos') && cache.get('userStaredRepos')) {
            return {
                userRepos: cache.get('userRepos'),
                userStaredRepos: cache.get('userStaredRepos')
            }
        }
    }

    // 服务端渲染不保存

    const [userRepos, userStaredRepos] = await Promise.all([
        api.request({
            url: '/user/repos'
        }, ctx.req, ctx.res),
        api.request({
            url: '/user/starred'
        }, ctx.req, ctx.res)
    ]);


    return {
        userRepos: userRepos.data,
        userStaredRepos: userStaredRepos.data
    }
};

export default withRouter(connect(function mapState(state) {
    return {
        user: state.user
    }
})(Index)) //withRouter在里面会冲突

