import React, {useState, useReducer, useLayoutEffect, useEffect, useContext, useRef,memo,useMemo,useCallback} from 'react'

import MyContext from '../../lib/my-context'

function countReducer(state, action) {
    switch (action.type) {
        case 'add':
            return state + 1;
        case 'minus':
            return state - 1
    }
}


function MyCountFunc() {
    const [count, dispatchCount] = useReducer(countReducer, 0);
    const [name, setName] = useState('MeSKiL');

    const countRef = useRef(); // 返回的是同一个对象而不是新对象，规避了比保险金
    countRef.current = count;

    const config = useMemo(()=>({
        text: `count is ${count}`,
        color: count > 3 ? 'red' : 'blue'
    }),[count]);

    // const handleButtonClick = useCallback(() => dispatchCount({type: 'add'}),[]);

    const handleButtonClick = useMemo(
        ()=>() => dispatchCount({type: 'add'}),[]
    );

    const handleAlertButtonClick = function(){
        setTimeout(()=>{
            alert(countRef.current)
        },2000)
    }
    return (
        <div>
            <input value={name} onChange={e => setName(e.target.value)} />
            <Child
                config={config}
                onButtonClick={handleButtonClick}
            />
            <button onClick={handleAlertButtonClick}>alert count</button>
        </div>
    )
}

const Child = memo(function Child({onButtonClick, config}) {
    console.log('child render');

    return (
        <button onClick={onButtonClick} style={{color: config.color}}>
            {config.text}
        </button>
    )
});


export default MyCountFunc