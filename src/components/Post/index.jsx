import { useState, useEffect } from 'react';
import { Table, Typography } from 'antd';
import { apis } from '../../configs';

const { Title } = Typography;

export default function Post() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 140,
            ellipsis: true,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Body',
            dataIndex: 'body',
            key: 'body',
            ellipsis: true,
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
    };

    return (
        <div className="px-4 py-6">
            <Title level={3} className="mb-4">Post</Title>
            <div className="overflow-x-auto">
                <Table
                    dataSource={data}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 600 }}
                    size="small"
                    pagination={{ pageSize: 10, responsive: true }}
                />
            </div>
        </div>
    );
}
