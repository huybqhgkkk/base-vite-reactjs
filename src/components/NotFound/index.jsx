import React from 'react';
import { Button, Result } from 'antd';

function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <Result
                status="404"
                title="404"
                subTitle="Trang bạn tìm kiếm không tồn tại."
                extra={
                    <Button type="primary" href="/">
                        Về trang chủ
                    </Button>
                }
            />
        </div>
    );
}

export default NotFound;
