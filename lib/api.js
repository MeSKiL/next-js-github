const axios = require('axios');
const isServer = typeof window === 'undefined';

const github_base_url = 'https://api.github.com';


function requestGithub(method,url,data,headers) {
    return axios({
        method,
        url: `${github_base_url}${url}`,
        data,
        headers
    })
}

// 区分服务端与客户端渲染

function request({method = 'GET', url, data = {}}, req, res) {
    if(!url){
        throw Error('url must provide')
    }
    if(isServer){
        const session = req.session;
        const githubAuth = session.githubAuth || {};
        const headers = {}

        if(githubAuth.access_token){
            headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`
        }
        return requestGithub(method,url,data,headers)
    }else{
        return axios({
            method,
            url:`/github${url}`
        })
    }
}

module.exports = {
    request,
    requestGithub
};