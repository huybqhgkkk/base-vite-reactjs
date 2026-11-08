import React, { useState } from 'react';
import {
    Button, Modal, Form, InputNumber, Input, Popconfirm, Typography, Card, Tag, Empty, Tooltip,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { getCars, saveCar, deleteCar } from './evStorage';

const { Text, Title } = Typography;

function genId() {
    return `car_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * EVCarManager
 * Props:
 *   cars: Car[]
 *   onCarsChange: () => void  — gọi lại khi có thay đổi
 *   onSelectCar: (car) => void
 *   selectedCarId: string | null
 */
export default function EVCarManager({ cars, onCarsChange, onSelectCar, selectedCarId }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = tạo mới
    const [form] = Form.useForm();

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (car) => {
        setEditing(car);
        form.setFieldsValue({
            name: car.name,
            batteryCapacity: car.batteryCapacity,
            consumptionPer100km: car.consumptionPer100km ?? null,
        });
        setModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const car = {
                id: editing?.id ?? genId(),
                name: values.name.trim(),
                batteryCapacity: values.batteryCapacity,
                consumptionPer100km: values.consumptionPer100km ?? 0,
                createdAt: editing?.createdAt ?? new Date().toISOString(),
            };
            saveCar(car);
            onCarsChange();
            setModalOpen(false);
        });
    };

    const handleDelete = (carId) => {
        deleteCar(carId);
        onCarsChange();
        if (selectedCarId === carId) onSelectCar(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <Title level={5} className="!mb-0">
                    <CarOutlined className="mr-1 text-green-600" /> Danh sách xe
                </Title>
                <Button type="primary" icon={<PlusOutlined />} size="small" onClick={openCreate}>
                    Thêm xe
                </Button>
            </div>

            {cars.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có xe nào. Nhấn 'Thêm xe' để bắt đầu."
                />
            ) : (
                <div className="flex flex-col gap-2">
                    {cars.map((car) => {
                        const isSelected = car.id === selectedCarId;
                        return (
                            <Card
                                key={car.id}
                                size="small"
                                className={`cursor-pointer transition-all ${
                                    isSelected
                                        ? 'border-green-500 bg-green-50 shadow'
                                        : 'hover:border-gray-400'
                                }`}
                                onClick={() => onSelectCar(car)}
                                extra={
                                    <div
                                        className="flex gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Tooltip title="Sửa xe">
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => openEdit(car)}
                                            />
                                        </Tooltip>
                                        <Popconfirm
                                            title="Xóa xe này?"
                                            description="Toàn bộ lịch sử sạc sẽ bị xóa."
                                            onConfirm={() => handleDelete(car.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                            />
                                        </Popconfirm>
                                    </div>
                                }
                            >
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Text strong className={isSelected ? 'text-green-700' : ''}>
                                        {car.name}
                                    </Text>
                                    <Tag color="blue" icon={<ThunderboltOutlined />}>
                                        {(car.batteryCapacity / 1000).toFixed(1)} kWh
                                    </Tag>
                                    {car.consumptionPer100km > 0 && (
                                        <Tag color="orange">
                                            {car.consumptionPer100km} Wh/100km
                                        </Tag>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                title={editing ? 'Sửa thông tin xe' : 'Thêm xe mới'}
                open={modalOpen}
                onOk={handleOk}
                onCancel={() => setModalOpen(false)}
                okText={editing ? 'Lưu' : 'Thêm'}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="name"
                        label="Tên xe"
                        rules={[{ required: true, message: 'Nhập tên xe' }]}
                    >
                        <Input placeholder="VD: VinFast VF8, Tesla Model 3…" maxLength={80} />
                    </Form.Item>
                    <Form.Item
                        name="batteryCapacity"
                        label="Dung lượng pin (Wh)"
                        rules={[{ required: true, message: 'Nhập dung lượng pin' }]}
                        tooltip="Dung lượng pin danh định ghi trong thông số kỹ thuật"
                    >
                        <InputNumber
                            min={1000}
                            max={999999}
                            step={100}
                            style={{ width: '100%' }}
                            placeholder="VD: 82000 (= 82 kWh)"
                            addonAfter="Wh"
                        />
                    </Form.Item>
                    <Form.Item
                        name="consumptionPer100km"
                        label="Tiêu thụ điện (Wh/100km) — không bắt buộc"
                        tooltip="Điện tiêu thụ thực tế trên 100 km, dùng để tính km được sạc thêm"
                    >
                        <InputNumber
                            min={0}
                            max={99999}
                            step={100}
                            style={{ width: '100%' }}
                            placeholder="VD: 18000 (= 180 Wh/km)"
                            addonAfter="Wh/100km"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
