import React, { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
    Button, Modal, Form, InputNumber, DatePicker, Table, Popconfirm, Typography,
    Statistic, Row, Col, Tag, Alert, Tooltip, Empty, Divider,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined,
    InfoCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { getLogs, saveLog, deleteLog, calcLog, calcCarStats } from './evStorage';

dayjs.extend(duration);

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

function genId() {
    return `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function fmtDuration(minutes) {
    if (!minutes) return '--';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h}g ${m}p`;
}

function fmtNum(v, suffix = '') {
    if (v == null) return '--';
    return `${Number(v).toLocaleString('vi-VN')}${suffix}`;
}

function efficiencyColor(eff) {
    if (eff >= 85) return '#52c41a';
    if (eff >= 70) return '#faad14';
    return '#ff4d4f';
}

/**
 * EVChargeLog
 * Props: car (Car object), logs (ChargeLog[]), onLogsChange
 */
export default function EVChargeLog({ car, logs, onLogsChange }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    // Computed data for each log
    const computedLogs = useMemo(
        () =>
            logs
                .map((l) => ({ ...l, _calc: calcLog(l, car) }))
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)),
        [logs, car]
    );

    const stats = useMemo(() => calcCarStats(logs, car), [logs, car]);

    // Chart data: efficiency over time (chronological)
    const chartData = useMemo(
        () =>
            [...computedLogs]
                .reverse()
                .filter((l) => l._calc)
                .map((l, i) => ({
                    session: i + 1,
                    date: dayjs(l.startTime).format('DD/MM'),
                    efficiency: l._calc.efficiency,
                    actualPower: l._calc.actualPower,
                })),
        [computedLogs]
    );

    const openCreate = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({
            chargerPower: car.defaultChargerPower ?? 7400,
            electricityCost: 2500,
        });
        setModalOpen(true);
    };

    const openEdit = (log) => {
        setEditing(log);
        form.setFieldsValue({
            soc: [log.startSoc, log.endSoc],
            timeRange: [dayjs(log.startTime), dayjs(log.endTime)],
            chargerPower: log.chargerPower,
            electricityCost: log.electricityCost ?? null,
        });
        setModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            const [startSoc, endSoc] = values.soc;
            const [startTime, endTime] = values.timeRange;
            const log = {
                id: editing?.id ?? genId(),
                carId: car.id,
                startSoc,
                endSoc,
                chargerPower: values.chargerPower,
                electricityCost: values.electricityCost ?? 0,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                createdAt: editing?.createdAt ?? new Date().toISOString(),
            };
            saveLog(log);
            onLogsChange();
            setModalOpen(false);
        });
    };

    const handleDelete = (logId) => {
        deleteLog(car.id, logId);
        onLogsChange();
    };

    const columns = [
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, r) => (
                <div>
                    <div className="text-xs font-medium">{dayjs(r.startTime).format('DD/MM/YYYY')}</div>
                    <div className="text-xs text-gray-500">
                        {dayjs(r.startTime).format('HH:mm')} → {dayjs(r.endTime).format('HH:mm')}
                    </div>
                    <div className="text-xs text-gray-400">{r._calc ? fmtDuration(r._calc.durationMinutes) : '--'}</div>
                </div>
            ),
        },
        {
            title: 'Pin (%)',
            key: 'soc',
            render: (_, r) => (
                <div className="text-sm">
                    <Tag color="orange">{r.startSoc}%</Tag>
                    →
                    <Tag color="green" className="ml-1">{r.endSoc}%</Tag>
                    <div className="text-xs text-gray-400 mt-0.5">+{r.endSoc - r.startSoc}%</div>
                </div>
            ),
        },
        {
            title: 'Năng lượng',
            key: 'energy',
            render: (_, r) =>
                r._calc ? (
                    <div className="text-sm">
                        <div>Pin: <Text strong>{fmtNum(r._calc.energyNeeded)} Wh</Text></div>
                        <div className="text-xs text-gray-500">Lưới: {fmtNum(r._calc.gridEnergy)} Wh</div>
                    </div>
                ) : <Text type="danger">Lỗi dữ liệu</Text>,
        },
        {
            title: 'Hiệu suất',
            key: 'efficiency',
            render: (_, r) =>
                r._calc ? (
                    <div>
                        <Text strong style={{ color: efficiencyColor(r._calc.efficiency) }}>
                            {r._calc.efficiency}%
                        </Text>
                        <div className="text-xs text-gray-500">
                            {fmtNum(r._calc.actualPower)} W thực tế
                        </div>
                        <div className="text-xs text-gray-400">
                            (đặt {fmtNum(r.chargerPower)} W)
                        </div>
                    </div>
                ) : '--',
        },
        {
            title: 'Chi phí',
            key: 'cost',
            render: (_, r) =>
                r._calc?.cost != null ? (
                    <div className="text-sm">
                        <Text strong className="text-orange-500">
                            {fmtNum(r._calc.cost)} đ
                        </Text>
                        <div className="text-xs text-gray-400">
                            @{fmtNum(r.electricityCost)} đ/kWh
                        </div>
                    </div>
                ) : (
                    <Text type="secondary">--</Text>
                ),
        },
        {
            title: 'Km thêm',
            key: 'km',
            render: (_, r) =>
                r._calc?.chargingKm != null ? (
                    <div className="text-sm">
                        <Text strong className="text-blue-600">+{r._calc.chargingKm} km</Text>
                        <div className="text-xs text-gray-400">
                            {r._calc.chargingSpeedKmH} km/h sạc
                        </div>
                    </div>
                ) : (
                    <Text type="secondary">--</Text>
                ),
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, r) => (
                <div className="flex gap-1">
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa lần sạc này?"
                        onConfirm={() => handleDelete(r.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* Stats summary */}
            {stats && (
                <>
                    <Row gutter={[12, 12]} className="mb-4">
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Số lần sạc"
                                value={stats.sessionCount}
                                suffix="lần"
                                valueStyle={{ fontSize: 18 }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Hiệu suất TB
                                        <Tooltip title="Trung bình hiệu suất sạc thực tế qua tất cả các lần">
                                            <InfoCircleOutlined className="ml-1 text-gray-400" />
                                        </Tooltip>
                                    </span>
                                }
                                value={stats.avgEfficiency}
                                suffix="%"
                                valueStyle={{
                                    fontSize: 18,
                                    color: efficiencyColor(stats.avgEfficiency),
                                }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title="Tổng điện lưới"
                                value={(stats.totalGridEnergy / 1000).toFixed(1)}
                                suffix="kWh"
                                valueStyle={{ fontSize: 18 }}
                            />
                        </Col>
                        {stats.totalCost != null && (
                            <Col xs={12} sm={6}>
                                <Statistic
                                    title="Tổng chi phí"
                                    value={stats.totalCost.toLocaleString('vi-VN')}
                                    suffix="đ"
                                    valueStyle={{ fontSize: 18, color: '#fa8c16' }}
                                />
                            </Col>
                        )}
                        {stats.totalKm != null && (
                            <Col xs={12} sm={6}>
                                <Statistic
                                    title="Tổng km đã sạc"
                                    value={stats.totalKm}
                                    suffix="km"
                                    valueStyle={{ fontSize: 18, color: '#1677ff' }}
                                />
                            </Col>
                        )}
                    </Row>

                    {/* Health warning */}
                    {stats.avgEfficiency < 80 && (
                        <Alert
                            className="mb-4"
                            type="warning"
                            showIcon
                            icon={<WarningOutlined />}
                            message={
                                <span>
                                    Hiệu suất sạc trung bình <strong>{stats.avgEfficiency}%</strong> — thấp hơn ngưỡng 80%.
                                    Pin có thể đang xuống cấp hoặc bộ sạc không đạt công suất.
                                </span>
                            }
                        />
                    )}

                    {/* Efficiency trend chart */}
                    {chartData.length >= 2 && (
                        <div className="mb-4">
                            <Text type="secondary" className="text-xs mb-1 block">
                                Xu hướng hiệu suất sạc theo thời gian
                            </Text>
                            <ResponsiveContainer width="100%" height={160}>
                                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                    <ReTooltip
                                        formatter={(v) => [`${v}%`, 'Hiệu suất']}
                                        labelFormatter={(_, payload) =>
                                            payload?.[0]
                                                ? `Lần ${payload[0].payload.session} — ${payload[0].payload.date}`
                                                : ''
                                        }
                                    />
                                    <ReferenceLine y={80} stroke="#faad14" strokeDasharray="4 4" label={{ value: '80%', fontSize: 10, fill: '#faad14' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="efficiency"
                                        stroke="#52c41a"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <Divider className="my-3" />
                </>
            )}

            {/* Log list */}
            <div className="flex items-center justify-between mb-3">
                <Title level={5} className="!mb-0">
                    <ThunderboltOutlined className="text-yellow-500 mr-1" />
                    Lịch sử sạc
                </Title>
                <Button type="primary" icon={<PlusOutlined />} size="small" onClick={openCreate}>
                    Thêm lần sạc
                </Button>
            </div>

            {computedLogs.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lần sạc nào được ghi lại."
                />
            ) : (
                <Table
                    dataSource={computedLogs.map((l) => ({ ...l, key: l.id }))}
                    columns={columns}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="small"
                    scroll={{ x: 600 }}
                />
            )}

            {/* Add / Edit modal */}
            <Modal
                title={editing ? 'Sửa lần sạc' : 'Thêm lần sạc mới'}
                open={modalOpen}
                onOk={handleOk}
                onCancel={() => setModalOpen(false)}
                okText={editing ? 'Lưu' : 'Thêm'}
                cancelText="Hủy"
                width={480}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="soc"
                        label="Mức pin: từ → đến (%)"
                        rules={[
                            { required: true, message: 'Nhập mức pin' },
                            {
                                validator: (_, val) => {
                                    if (!val || val[0] == null || val[1] == null)
                                        return Promise.reject('Nhập đủ 2 giá trị');
                                    if (val[1] <= val[0])
                                        return Promise.reject('% đích phải lớn hơn % hiện tại');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <SocRangeInput />
                    </Form.Item>

                    <Form.Item
                        name="timeRange"
                        label="Thời gian sạc (từ → đến)"
                        rules={[
                            { required: true, message: 'Chọn khoảng thời gian sạc' },
                            {
                                validator: (_, val) => {
                                    if (!val || !val[0] || !val[1]) return Promise.reject('Chọn đủ giờ bắt đầu và kết thúc');
                                    if (val[1].isBefore(val[0])) return Promise.reject('Giờ kết thúc phải sau giờ bắt đầu');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <RangePicker
                            showTime={{ format: 'HH:mm', minuteStep: 5 }}
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            placeholder={['Bắt đầu sạc', 'Kết thúc sạc']}
                        />
                    </Form.Item>

                    <Form.Item
                        name="chargerPower"
                        label="Công suất sạc (W)"
                        rules={[{ required: true, message: 'Nhập công suất sạc' }]}
                        tooltip="Công suất danh định của bộ sạc (AC 7.4 kW = 7400 W, DC 50 kW = 50000 W…)"
                    >
                        <InputNumber
                            min={100}
                            max={999999}
                            step={100}
                            style={{ width: '100%' }}
                            addonAfter="W"
                            placeholder="VD: 7400"
                        />
                    </Form.Item>

                    <Form.Item
                        name="electricityCost"
                        label="Giá điện (đ/kWh) — không bắt buộc"
                        tooltip="Để tính chi phí sạc. Để trống nếu không cần tính tiền."
                    >
                        <InputNumber
                            min={0}
                            max={99999}
                            step={100}
                            style={{ width: '100%' }}
                            addonAfter="đ/kWh"
                            placeholder="VD: 2500"
                            formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                            parser={(v) => v.replace(/,/g, '')}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

/** Custom input: 2 InputNumber kết hợp thành [startSoc, endSoc] */
function SocRangeInput({ value, onChange }) {
    // Ant Design Form sẽ truyền value từ ngoài vào; ta dùng trực tiếp.
    const start = value?.[0] ?? null;
    const end = value?.[1] ?? null;

    return (
        <div className="flex items-center gap-2">
            <InputNumber
                min={0}
                max={99}
                value={start}
                onChange={(v) => onChange?.([v, end])}
                addonAfter="%"
                placeholder="Từ"
                style={{ flex: 1 }}
            />
            <span className="text-gray-400">→</span>
            <InputNumber
                min={1}
                max={100}
                value={end}
                onChange={(v) => onChange?.([start, v])}
                addonAfter="%"
                placeholder="Đến"
                style={{ flex: 1 }}
            />
        </div>
    );
}
