import React from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { nameVal } from '../../helpers/utils.jsx';

const { Title } = Typography;

const MyForm = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const usernameRules = [
        { required: true, message: 'Please input your username!' },
        { pattern: nameVal, message: 'Invalid username format!' },
        { max: 80, message: 'Username length should be less than or equal to 80!' },
        { whitespace: true, message: 'Username cannot start or end with space!' },
        ({ getFieldValue }) => ({
            validator(_, value) {
                if (value.length > 80 || value.length < 0) {
                    return Promise.reject('Số kí tự chỉ cho phép từ 1 đến 80');
                }
                if (value[0] === ' ' || value[value.length - 1] === ' ') {
                    return Promise.reject('Không được phép viết kí tự cách ở đầu và cuối');
                }
                return Promise.resolve();
            },
        }),
    ];

    const passwordRules = [
        { required: true, message: 'Please input your password!' },
    ];

    return (
        <div className="px-4 py-6">
            <Title level={3} className="mb-6">Form</Title>
            <Form
                form={form}
                name="basic"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                className="w-full max-w-lg"
            >
                <Form.Item label="Username" name="username" rules={usernameRules}>
                    <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={passwordRules}>
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" danger className="w-full sm:w-auto">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default MyForm;
