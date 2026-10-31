import React, { useState } from 'react';
import { InputNumber, Button, Table, Divider, Radio, Typography, Alert } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Biểu giá điện sinh hoạt 6 bậc – QĐ 1279/QĐ-BCT (hiệu lực từ 10/05/2025)
 *   Bậc 1:   0 –  50 kWh  →  1.984 đ/kWh
 *   Bậc 2:  51 – 100 kWh  →  2.050 đ/kWh
 *   Bậc 3: 101 – 200 kWh  →  2.380 đ/kWh
 *   Bậc 4: 201 – 300 kWh  →  2.998 đ/kWh
 *   Bậc 5: 301 – 400 kWh  →  3.350 đ/kWh
 *   Bậc 6: > 400 kWh      →  3.460 đ/kWh
 *
 * VAT: 8% (NQ 204/2025/QH15 – áp dụng đến 31/12/2026)
 * Nguồn: calculatorlib.com/tinh-tien-dien (cập nhật 30/10/2026)
 */
const TIERS = [
    { tier: 1, label: 'Bậc 1 (0 – 50 kWh)',    capacity: 50,       price: 1984 },
    { tier: 2, label: 'Bậc 2 (51 – 100 kWh)',  capacity: 50,       price: 2050 },
    { tier: 3, label: 'Bậc 3 (101 – 200 kWh)', capacity: 100,      price: 2380 },
    { tier: 4, label: 'Bậc 4 (201 – 300 kWh)', capacity: 100,      price: 2998 },
    { tier: 5, label: 'Bậc 5 (301 – 400 kWh)', capacity: 100,      price: 3350 },
    { tier: 6, label: 'Bậc 6 (> 400 kWh)',     capacity: Infinity, price: 3460 },
];

const VAT_RATE = 0.08;

function calcMoneyFromKwh(kwh) {
    let total = 0;
    const breakdown = [];
    let remaining = kwh;

    for (const tier of TIERS) {
        if (remaining <= 0) break;
        const used = tier.capacity === Infinity ? remaining : Math.min(remaining, tier.capacity);
        const subtotal = used * tier.price;
        breakdown.push({ ...tier, used, subtotal });
        total += subtotal;
        remaining -= used;
    }

    const vat = Math.round(total * VAT_RATE);
    return { beforeTax: Math.round(total), vat, afterTax: Math.round(total) + vat, breakdown };
}

function calcKwhFromMoney(targetAfterTax) {
    let lo = 0, hi = 10000;
    for (let i = 0; i < 120; i++) {
        const mid = (lo + hi) / 2;
        const { afterTax } = calcMoneyFromKwh(mid);
        if (afterTax < targetAfterTax) lo = mid;
        else hi = mid;
    }
    return Math.round((lo + hi) / 2);
}

export default function ElectricityCalculator() {
    const [mode, setMode] = useState('kwh_to_money');
    const [kwh, setKwh] = useState(null);
    const [money, setMoney] = useState(null);
    const [result, setResult] = useState(null);

    const handleCalc = () => {
        if (mode === 'kwh_to_money') {
            if (!kwh || kwh <= 0) return;
            setResult({ type: 'kwh_to_money', kwh, ...calcMoneyFromKwh(kwh) });
        } else {
            if (!money || money <= 0) return;
            const kwhCalc = calcKwhFromMoney(money);
            setResult({ type: 'money_to_kwh', money, kwh: kwhCalc, ...calcMoneyFromKwh(kwhCalc) });
        }
    };

    const columns = [
        { title: 'Bậc', dataIndex: 'label', key: 'label' },
        {
            title: 'Số kWh dùng',
            dataIndex: 'used',
            key: 'used',
            align: 'right',
            render: (v) => `${Number(v.toFixed(1)).toLocaleString('vi-VN')} kWh`,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            render: (v) => `${v.toLocaleString('vi-VN')} đ/kWh`,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            align: 'right',
            render: (v) => `${Math.round(v).toLocaleString('vi-VN')} đ`,
        },
    ];

    return (
        <div className="p-2 sm:p-4 w-full">
            <Title level={4} className="flex items-center gap-2 !text-base sm:!text-lg">
                <ThunderboltOutlined className="text-yellow-500" /> Tính tiền điện gia đình
            </Title>

            <Alert
                className="mb-4"
                type="info"
                showIcon
                message={
                    <span className="text-xs sm:text-sm">
                        Biểu giá 6 bậc – QĐ 1279/QĐ-BCT (từ 10/05/2025) · VAT <strong>8%</strong> (đến 31/12/2026)
                    </span>
                }
            />

            <Radio.Group
                value={mode}
                onChange={(e) => { setMode(e.target.value); setResult(null); }}
                className="mb-4 w-full"
                buttonStyle="solid"
            >
                <Radio.Button value="kwh_to_money" className="w-1/2 text-center">Số điện → Tiền</Radio.Button>
                <Radio.Button value="money_to_kwh" className="w-1/2 text-center">Tiền → Số điện</Radio.Button>
            </Radio.Group>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                {mode === 'kwh_to_money' ? (
                    <InputNumber
                        min={1}
                        max={10000}
                        value={kwh}
                        onChange={setKwh}
                        placeholder="Nhập số kWh"
                        addonAfter="kWh"
                        className="flex-1 min-w-0"
                        style={{ minWidth: 0 }}
                    />
                ) : (
                    <InputNumber
                        min={1}
                        value={money}
                        onChange={setMoney}
                        placeholder="Nhập số tiền (đã VAT)"
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
                    {result.type === 'money_to_kwh' && (
                        <div className="mb-3">
                            <Alert
                                type="success"
                                message={
                                    <span>
                                        Với <strong>{result.money.toLocaleString('vi-VN')} đ</strong> (đã VAT 8%), dùng khoảng{' '}
                                        <strong>{result.kwh.toLocaleString('vi-VN')} kWh</strong>
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
                            <Text>Tiền điện (chưa VAT):</Text>
                            <Text strong>{result.beforeTax.toLocaleString('vi-VN')} đ</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text>VAT 8%:</Text>
                            <Text>{result.vat.toLocaleString('vi-VN')} đ</Text>
                        </div>
                        <Divider className="my-1" />
                        <div className="flex justify-between">
                            <Text strong className="text-base">Tổng cộng:</Text>
                            <Text strong className="text-base text-red-600">
                                {result.afterTax.toLocaleString('vi-VN')} đ
                            </Text>
                        </div>
                        <div className="flex justify-between">
                            <Text type="secondary">Đơn giá bình quân (có VAT):</Text>
                            <Text type="secondary">
                                {result.kwh > 0
                                    ? Math.round(result.afterTax / result.kwh).toLocaleString('vi-VN')
                                    : 0}{' '}
                                đ/kWh
                            </Text>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
