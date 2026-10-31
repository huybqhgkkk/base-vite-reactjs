import React, { useState } from 'react';
import { InputNumber, Button, Table, Divider, Radio, Typography, Alert, Tooltip } from 'antd';
import { ExperimentOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Biểu giá nước sinh hoạt Hà Nội – Giai đoạn 2 (hiệu lực từ 1/1/2024)
 * QĐ 18/2023/QĐ-UBND UBND TP Hà Nội
 *
 * Bậc 1:  0 – 10 m³  →  8.500 đ/m³
 * Bậc 2: 11 – 20 m³  → 10.200 đ/m³
 * Bậc 3: 21 – 30 m³  → 12.000 đ/m³
 * Bậc 4:  > 30 m³    → 24.000 đ/m³
 *
 * Phí bảo vệ môi trường: 10% giá nước (trước VAT)
 * VAT: 5% (tính trên giá nước + phí BVMT)
 *
 * Nguồn: VnExpress (11/7/2023), QĐ 18/2023/QĐ-UBND Hà Nội
 */
const WATER_TIERS = [
    { tier: 1, label: 'Bậc 1 (0 – 10 m³)',  capacity: 10,       price: 8500 },
    { tier: 2, label: 'Bậc 2 (11 – 20 m³)', capacity: 10,       price: 10200 },
    { tier: 3, label: 'Bậc 3 (21 – 30 m³)', capacity: 10,       price: 12000 },
    { tier: 4, label: 'Bậc 4 (> 30 m³)',    capacity: Infinity, price: 24000 },
];

const ENV_FEE_RATE = 0.10; // 10% phí bảo vệ môi trường
const VAT_RATE = 0.05;     // VAT 5% nước sinh hoạt

function calcMoneyFromM3(m3) {
    let total = 0;
    const breakdown = [];
    let remaining = m3;

    for (const tier of WATER_TIERS) {
        if (remaining <= 0) break;
        const used = tier.capacity === Infinity ? remaining : Math.min(remaining, tier.capacity);
        const subtotal = used * tier.price;
        breakdown.push({ ...tier, used, subtotal });
        total += subtotal;
        remaining -= used;
    }

    const envFee = Math.round(total * ENV_FEE_RATE);
    const vat = Math.round((total + envFee) * VAT_RATE);
    const afterTax = total + envFee + vat;

    return { beforeFees: total, envFee, vat, afterTax, breakdown };
}

/**
 * Tính ngược m³ từ số tiền (đã bao gồm phí + VAT)
 */
function calcM3FromMoney(targetAfterTax) {
    let lo = 0, hi = 10000;
    for (let i = 0; i < 100; i++) {
        const mid = (lo + hi) / 2;
        const { afterTax } = calcMoneyFromM3(mid);
        if (afterTax < targetAfterTax) lo = mid;
        else hi = mid;
    }
    return Math.round((lo + hi) / 2);
}

export default function WaterCalculator() {
    const [mode, setMode] = useState('m3_to_money');
    const [m3, setM3] = useState(null);
    const [money, setMoney] = useState(null);
    const [result, setResult] = useState(null);

    const handleCalc = () => {
        if (mode === 'm3_to_money') {
            if (!m3 || m3 <= 0) return;
            setResult({ type: 'm3_to_money', m3, ...calcMoneyFromM3(m3) });
        } else {
            if (!money || money <= 0) return;
            const m3Calc = calcM3FromMoney(money);
            setResult({ type: 'money_to_m3', money, m3: m3Calc, ...calcMoneyFromM3(m3Calc) });
        }
    };

    const columns = [
        { title: 'Bậc', dataIndex: 'label', key: 'label' },
        {
            title: 'Số m³ dùng',
            dataIndex: 'used',
            key: 'used',
            render: (v) => `${v.toFixed(0)} m³`,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (v) => `${v.toLocaleString('vi-VN')} đ/m³`,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (v) => `${Math.round(v).toLocaleString('vi-VN')} đ`,
        },
    ];

    return (
        <div className="p-2 sm:p-4 w-full">
            <Title level={4} className="flex items-center gap-2 !text-base sm:!text-lg">
                <ExperimentOutlined className="text-blue-500" /> Tính tiền nước gia đình (Hà Nội)
            </Title>

            <Alert
                className="mb-4"
                type="info"
                showIcon
                message={
                    <span className="text-xs sm:text-sm">
                        Biểu giá nước Hà Nội (từ 1/1/2024) – QĐ 18/2023/QĐ-UBND · VAT 5% + Phí BVMT 10%{' '}
                        <Tooltip title="Phí bảo vệ môi trường = 10% giá nước trước thuế. VAT 5% tính trên (giá nước + phí BVMT).">
                            <InfoCircleOutlined className="cursor-pointer" />
                        </Tooltip>
                    </span>
                }
            />

            <Radio.Group
                value={mode}
                onChange={(e) => { setMode(e.target.value); setResult(null); }}
                className="mb-4 w-full"
                buttonStyle="solid"
            >
                <Radio.Button value="m3_to_money" className="w-1/2 text-center">Số m³ → Tiền</Radio.Button>
                <Radio.Button value="money_to_m3" className="w-1/2 text-center">Tiền → Số m³</Radio.Button>
            </Radio.Group>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {mode === 'm3_to_money' ? (
                    <InputNumber
                        min={1}
                        max={10000}
                        value={m3}
                        onChange={setM3}
                        placeholder="Nhập số m³"
                        addonAfter="m³"
                        className="flex-1 min-w-0"
                        style={{ minWidth: 0 }}
                    />
                ) : (
                    <InputNumber
                        min={1}
                        value={money}
                        onChange={setMoney}
                        placeholder="Nhập số tiền"
                        addonAfter="đ"
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(v) => v.replace(/,/g, '')}
                        className="flex-1 min-w-0"
                        style={{ minWidth: 0 }}
                    />
                )}
                <Button type="primary" onClick={handleCalc} className="flex-shrink-0">Tính</Button>
            </div>

            {result && (
                <>
                    <Divider />
                    {result.type === 'money_to_m3' && (
                        <div className="mb-3">
                            <Alert
                                type="success"
                                message={
                                    <span>
                                        Với <strong>{result.money.toLocaleString('vi-VN')} đ</strong> (đã thuế + phí), bạn dùng khoảng{' '}
                                        <strong>{result.m3} m³</strong>
                                    </span>
                                }
                            />
                        </div>
                    )}

                    <Table
                        dataSource={result.breakdown.map((r, i) => ({ ...r, key: i }))}
                        columns={columns}
                        pagination={false}
                        size="small"
                        className="mb-3"
                        scroll={{ x: true }}
                    />

                    <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                        <div className="flex justify-between">
                            <Text>Tiền nước (chưa phí):</Text>
                            <Text strong>{result.beforeFees.toLocaleString('vi-VN')} đ</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text>Phí BVMT (10%):</Text>
                            <Text>{result.envFee.toLocaleString('vi-VN')} đ</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text>VAT 5%:</Text>
                            <Text>{result.vat.toLocaleString('vi-VN')} đ</Text>
                        </div>
                        <Divider className="my-1" />
                        <div className="flex justify-between">
                            <Text strong className="text-base">Tổng cộng:</Text>
                            <Text strong className="text-base text-blue-600">
                                {result.afterTax.toLocaleString('vi-VN')} đ
                            </Text>
                        </div>
                        <div className="flex justify-between">
                            <Text type="secondary">Đơn giá bình quân:</Text>
                            <Text type="secondary">
                                {result.m3 > 0
                                    ? Math.round(result.afterTax / result.m3).toLocaleString('vi-VN')
                                    : 0}{' '}
                                đ/m³
                            </Text>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
