import React from 'react';
import { Form, Input, Button } from 'antd';
import { nameVal } from '../../helpers/utils.jsx';

const MyForm = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Received values of form: ', values);
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const usernameRules = [
        {
            required: true,
            message: 'Please input your username!',
        },
        {
            pattern: nameVal,
            message: 'Invalid username format!',
        },
        {
            max: 80,
            message: 'Username length should be less than or equal to 80!',
        },
        {
            whitespace: true,
            message: 'Username cannot start or end with space!',
        },
        ({ getFieldValue }) => ({
            validator(_, value) {
                if ( value.length > 80 || value.length < 0) {
                    return Promise.reject("Số kí tự chỉ cho phép từ 1 đến 80");
                } else
                if(value[0] == ' ' || value[value.length -1] == ' ') {
                    return Promise.reject("Không được phép viết kí tự cách ở đầu và cuối");
                }
                return Promise.resolve();
            },
        }),
    ];

    const passwordRules = [
        {
            required: true,
            message: 'Please input your password!',
        },
    ];

    return (
        <Form
            form={form}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            className="mt-5 p-4 max-w-lg"
        >
            <Form.Item label="Username" name="username" rules={usernameRules}>
                <Input />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={passwordRules}>
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" danger>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MyForm;