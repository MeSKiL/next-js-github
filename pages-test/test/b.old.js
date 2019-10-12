import React, { useState,useReducer,useLayoutEffect,useEffect,useContext,useRef } from 'react'

import MyContext from '../../lib/my-context'

function MyCountFunc() {
    const [count,setCount ] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCount(c => c+1)
        },1000)
        return () => clearInterval(interval)
    },[]);

    return <span>{count}</span>
}

function countReducer(state,action) {
    switch (action.type) {
        case 'add':
            return state+1;
        case 'minus':
            return state-1;
        default:
            return state
    }
}

function MyCountReducer(){
    const [count,dispatchCount] = useReducer(countReducer,0);
    const [name,setName] = useState('MeSKiL');

    const context = useContext(MyContext);
    const inputRef = useRef();
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         dispatchCount({type:'minus'})
    //     },1000)
    //     return () => clearInterval(interval)
    // },[]);

    useEffect(()=>{
        console.log('effect invoked')
        console.log(inputRef)

        return ()=>console.log('effect deteched')
    },[count,name]);


    //会在任何一个属性更新后直接运行，执行完之后再渲染dom树，执行时间太长会导致渲染过慢。用户体验变差
    /*useLayoutEffect(()=>{
        console.log('layout effect invoked')
        return ()=>console.log('layout effect deteched')
    },[count,name]);*/

    return (
        <div>
            <input ref={inputRef} value={name} onChange={(e)=>setName(e.target.value)}/>
            <button onClick={()=>dispatchCount({type:'add'})}>{count}</button>
            <p>{context}</p>
        </div>
    )

}

export default MyCountReducer