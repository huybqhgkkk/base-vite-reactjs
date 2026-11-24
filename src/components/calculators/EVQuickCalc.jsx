import React, { useState } from 'react';
import { InputNumber, Button, Divider, Typography, Alert, Tooltip, Row, Col, Statistic } from 'antd';
import { ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

function formatDuration(hours) {
    if (!hours || hours <= 0) return '--';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h} giờ ${m} phút`;
}

export default function EVQuickCalc() {
    const [form, setForm] = useState({
        currentSoc: 20,
        targetSoc: 85,
        chargerPower: 466,
        chargeEfficiency: 85,
        batteryCapacity: 2400,
    });
    const [result, setResult] = useState(null);

    const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleCalc = () => {
        const { currentSoc, targetSoc, chargerPower, chargeEfficiency, batteryCapacity } = form;

        if (targetSoc <= currentSoc) {
            setResult({ error: '% pin đích phải lớn hơn % pin hiện tại' });
            return;
        }

        const efficiency = chargeEfficiency / 100;
        const energyNeeded = batteryCapacity * (targetSoc - currentSoc) / 100;
        const chargingHours = energyNeeded / (chargerPower * efficiency);
        const gridElectricity = energyNeeded / efficiency;
        const gridElectricityKwh = gridElectricity / 1000;
        const costHome = gridElectricityKwh * 2500;
        const costStation = gridElectricityKwh * 3200;

        setResult({
            error: null,
            energyNeeded: Math.round(energyNeeded),
            gridElectricity: Math.round(gridElectricity),
            chargingHours: +chargingHours.toFixed(3),
            costHome: Math.round(costHome),
            costStation: Math.round(costStation),
            socDelta: targetSoc - currentSoc,
        });
    };

    const fields = [
        { key: 'currentSoc', label: '% Pin hiện tại', unit: '%', min: 0, max: 99, tip: 'Phần trăm pin xe hiện tại trước khi sạc' },
        { key: 'targetSoc', label: '% Pin muốn sạc tới', unit: '%', min: 1, max: 100, tip: 'Phần trăm pin mong muốn sau khi sạc' },
        { key: 'batteryCapacity', label: 'Dung lượng pin gốc', unit: 'Wh', min: 1000, max: 999999999, step: 100, tip: 'Dung lượng pin danh định (ghi trong thông số kỹ thuật)' },
        { key: 'chargerPower', label: 'Công suất sạc', unit: 'W', min: 100, max: 350000, step: 100, tip: 'Công suất bộ sạc (AC 7.400 W, DC 50.000 W…)' },
        { key: 'chargeEfficiency', label: 'Hiệu suất sạc ước tính', unit: '%', min: 30, max: 100, tip: 'Hiệu suất chuyển đổi điện lưới vào pin (~85–95%)' },
    ];

    return (
        <div className="w-full">
            <Alert
                className="mb-4"
                type="info"
                showIcon
                message={
                    <span className="text-xs sm:text-sm">
                        Tính nhanh thời gian sạc. Dùng tab <strong>Theo dõi xe</strong> để ghi lại và đo hiệu suất thực tế.
                    </span>
                }
            />

            <Row gutter={[16, 12]}>
                {fields.map((f) => (
                    <Col xs={24} sm={12} key={f.key}>
                        <div className="flex flex-col gap-1">
                            <Text className="text-sm">
                                {f.label}
                                <Tooltip title={f.tip}>
                                    <InfoCircleOutlined className="ml-1 text-gray-400 cursor-pointer" />
                                </Tooltip>
                            </Text>
                            <InputNumber
                                min={f.min}
                                max={f.max}
                                step={f.step || 1}
                                value={form[f.key]}
                                onChange={set(f.key)}
                                addonAfter={f.unit}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                ))}
            </Row>

            <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleCalc}
                className="mt-4"
                block
            >
                Tính thời gian sạc
            </Button>

            {result && (
                <>
                    <Divider />
                    {result.error ? (
                        <Alert type="error" message={result.error} showIcon />
                    ) : (
                        <>
                            <Row gutter={[16, 16]} className="mb-4">
                                <Col xs={24} sm={8}>
                                    <Statistic
                                        title="Thời gian sạc"
                                        value={formatDuration(result.chargingHours)}
                                        valueStyle={{ color: '#1677ff', fontSize: 20 }}
                                    />
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Statistic
                                        title="Năng lượng nạp vào pin"
                                        value={result.energyNeeded}
                                        suffix="Wh"
                                    />
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Statistic
                                        title="Điện lấy từ lưới"
                                        value={result.gridElectricity}
                                        suffix="Wh"
                                        valueStyle={{ color: '#faad14' }}
                                    />
                                </Col>
                            </Row>

                            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between gap-2">
                                    <Text className="text-sm shrink-0">Tăng % pin:</Text>
                                    <Text strong className="text-right">
                                        {form.currentSoc}% → {form.targetSoc}% (+{result.socDelta}%)
                                    </Text>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <Text className="text-sm shrink-0">Tổn hao hiệu suất:</Text>
                                    <Text type="warning" className="text-right">
                                        {(result.gridElectricity - result.energyNeeded).toLocaleString('vi-VN')} Wh
                                        ({100 - form.chargeEfficiency}%)
                                    </Text>
                                </div>
                                <Divider className="my-1" />
                                <div className="flex justify-between gap-2">
                                    <Text className="text-sm shrink-0">Tại nhà (~2.500 đ/kWh):</Text>
                                    <Text strong className="text-green-600 text-right">
                                        {result.costHome.toLocaleString('vi-VN')} đ
                                    </Text>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <Text className="text-sm shrink-0">Trạm công cộng (~3.200 đ/kWh):</Text>
                                    <Text strong className="text-orange-500 text-right">
                                        {result.costStation.toLocaleString('vi-VN')} đ
                                    </Text>
                                </div>
                            </div>

                            <Alert
                                className="mt-3"
                                type="warning"
                                showIcon
                                message="Thời gian thực tế có thể dài hơn do sạc chậm dần khi gần đầy, nhiệt độ pin, và giới hạn trạm sạc."
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
