import { useState, useEffect } from 'react';
import { Table } from 'antd';
import { apis } from '../../configs';

export default function Post() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Body',
            dataIndex: 'body',
            key: 'body',
        },
    ];

    useEffect(() => {
        setLoading(true);
        getPost();
    }, []);

    const getPost = () => {
        apis.getPost()
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }

    return (
        <div>
            <h1>Post</h1>
            <Table dataSource={data} columns={columns} loading={loading} rowKey="id" />
        </div>
    );
}
