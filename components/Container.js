import { cloneElement } from 'react'

const style = {
    width:'100%',
    maxWidth:1200,
    marginLeft:'auto',
    marginRight:'auto',
    paddingLeft:20,
    paddingRight:20
};

export default ({children,renderer = <div />})=>{
    // 再原有renderer的基础上增加了一些props，并返回
    return cloneElement(renderer,{
       style:Object.assign({},renderer.props.style,style), // 避免直接传入style时冲突
       children
    });
}