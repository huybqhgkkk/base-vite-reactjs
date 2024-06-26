import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from '../../reducers/counterSlice';
import { Button } from 'antd';
function Counter() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <h1>Count: {count}</h1>
            <Button onClick={() => dispatch(increment())}>Increment</Button>
            <Button onClick={() => dispatch(decrement())}>Decrement</Button>
            <Button onClick={() => dispatch(reset())}>Reset</Button>
        </div>
    );
}

export default Counter;
