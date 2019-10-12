import {memo, isValidElement,useEffect} from 'react'
import {withRouter} from 'next/router'
import {Row, Col, List, Pagination} from 'antd'

import Link from 'next/link'

const api = require('../lib/api'); // 服务端渲染时不能用import

import Repo from '../components/Repo'
import {cacheArray} from "../lib/repo-basic-cache";

const LANGUAGES = ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'Java', 'Rust'];

const SORT_TYPES = [
    {
        name: 'Best Match'
    },
    {
        name: 'Most Stars',
        value: 'stars',
        order: 'desc'
    }, {
        name: 'Fewest Stars',
        value: 'stars',
        order: 'asc'
    }, {
        name: 'Most Forks',
        value: 'forks',
        order: 'desc'
    }, {
        name: 'Fewest Forks',
        value: 'forks',
        order: 'asc'
    },
];

const selectedItemStyle = {
    borderLeft: '2px solid #e36209',
    fontWeight: 100
};

function noop() {

}

const isServer = typeof window === 'undefined';

const per_page = 10;

const FilterLink = memo(({name, query, lang, sort, order, page}) => {
    let queryString = `?query=${query}`;
    if (lang) {
        queryString += `&lang=${lang}`
    }
    if (sort) {
        queryString += `&sort=${sort}&order=${order || 'desc'}`
    }
    if (page) {
        queryString += `&page=${page}`
    }

    queryString +=`&per_page=${per_page}`;

    // 便利seo
    return <Link href={`/search${queryString}`}>
        {
            isValidElement(name) ? name : <a>{name}</a>
            // 针对分页组件
        }
    </Link>
});


function Search({router, repos}) {
    // 不创建state，有url控制，受控组件不会有副作用

    const {...querys} = router.query;
    const {lang, sort, order, page} = router.query;

    useEffect(()=>{
        if(!isServer){
            cacheArray(repos.items)
        }
    });

    return (
        <div className="root">
            <Row gutter={20}>
                <Col span={6}>
                    <List bordered
                          header={<span className="list-header">语言</span>}
                          style={{marginBottom: 20}}
                          dataSource={LANGUAGES}
                          renderItem={item => {
                              const selected = lang === item;
                              return (

                                  <List.Item style={selected ? selectedItemStyle : null}>
                                      {
                                          selected ? <span>{item}</span> :
                                              <FilterLink {...querys} name={item} lang={item} page={1} />
                                      }
                                  </List.Item>
                              )
                          }}
                    />
                    <List bordered
                          header={<span className="list-header">排序</span>}
                          style={{marginBottom: 20}}
                          dataSource={SORT_TYPES}
                          renderItem={item => {
                              let selected = false;
                              if (item.name === 'Best Match' && !sort) {
                                  selected = true;
                              } else if (item.value === sort && item.order === order) {
                                  selected = true;
                              }
                              return (
                                  <List.Item style={selected ? selectedItemStyle : null}>
                                      {
                                          selected ? <span>{item.name}</span> :
                                              <FilterLink {...querys} name={item.name} sort={item.value}
                                                          order={item.order} page={1} />
                                      }
                                  </List.Item>
                              )
                          }}
                    />
                </Col>
                <Col span={18}>
                    <h3 className="repos-title">{repos.total_count}个仓库</h3>
                    {
                        repos.items.map(repo => <Repo repo={repo} key={repo.id} />)
                    }
                    <div className="pagination">
                        <Pagination
                            pageSize={per_page}
                            current={Number(page) || 1}
                            // total={repos.total_count}
                            total={repos.total_count>=1000?1000:repos.total_count} // github接口最多返回1000条
                            onChange={noop}
                            itemRender={(page, type, ol) => {
                                const name = type === 'page' ? page : ol;
                                return <FilterLink {...querys} page={page} name={name} />
                            }}
                        />
                    </div>
                </Col>
            </Row>
            <style jsx>{`
                .root{
                    padding:20px 0;
                }
                .list0-header{
                    font-weight:800;
                    font-size:16px;
                }
                .repos-title{
                    border-bottom:1px solid #eee;
                    font-size:24px;
                    line-height:50px;
                }
                .pagination{
                    padding:20px;
                    text-align:center;
                }
            `}</style>
        </div>
    )
}

Search.getInitialProps = async ({ctx}) => {
    const {query, sort, lang, order, page} = ctx.query;
    if (!query) {
        return {
            repos: {
                total_count: 0
            }
        }
    }
    let queryString = `?q=${query}`;
    if (lang) {
        queryString += `+language:${lang}`
    }
    if (sort) {
        queryString += `&sort=${sort}&order=${order || 'desc'}`
    }
    if (page) {
        queryString += `&page=${page}`
    }
    queryString += `&per_page=${per_page}`
    const res = await api.request({
        url: `/search/repositories${queryString}`
    }, ctx.req, ctx.res);

    return {
        repos: res.data
    }
};

export default withRouter(Search)