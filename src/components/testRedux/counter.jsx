import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset } from '../../reducers/counterSlice';
import { Button, Typography } from 'antd';

const { Title } = Typography;

function Counter() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div className="px-4 py-6">
            <Title level={3} className="mb-6">Counter</Title>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-2xl font-semibold w-full sm:w-auto">
                    Count: <span className="text-blue-600">{count}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                    <Button type="primary" onClick={() => dispatch(increment())}>
                        + Increment
                    </Button>
                    <Button danger onClick={() => dispatch(decrement())}>
                        − Decrement
                    </Button>
                    <Button onClick={() => dispatch(reset())}>
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Counter;
