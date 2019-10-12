const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const SCOPE = 'user';
const client_id = '91df75e0a734e051c700';
module.exports = {
    github: {
        request_token_url: 'https://github.com/login/oauth/access_token',
        client_id,
        client_secret: '6352e95086c5f385880dbd692e93b6146b00c1d9'
    },
    GITHUB_OAUTH_URL,
    OAUTH_URL: `${GITHUB_OAUTH_URL}?client_id=${client_id}&scope=${SCOPE}`

};
