import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, Typography, Spin, Alert } from 'antd';
import { CarOutlined, ThunderboltOutlined, CalculatorOutlined } from '@ant-design/icons';
import EVCarManager from './EVCarManager';
import EVChargeLog from './EVChargeLog';
import EVQuickCalc from './EVQuickCalc';
import { getCars, getLogs } from './evStorage';

const { Title } = Typography;

export default function EVChargeCalculator() {
    const [cars, setCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('tracker');
    const [loadingCars, setLoadingCars] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [error, setError] = useState(null);

    // Load danh sách xe lần đầu
    useEffect(() => {
        setLoadingCars(true);
        getCars()
            .then(setCars)
            .catch((e) => setError(e.message))
            .finally(() => setLoadingCars(false));
    }, []);

    const refreshCars = useCallback(async () => {
        try {
            const updated = await getCars();
            setCars(updated);
            if (selectedCar) {
                const found = updated.find((c) => c.id === selectedCar.id);
                setSelectedCar(found ?? null);
                if (found) {
                    const updatedLogs = await getLogs(found.id);
                    setLogs(updatedLogs);
                } else {
                    setLogs([]);
                }
            }
        } catch (e) {
            setError(e.message);
        }
    }, [selectedCar]);

    const handleSelectCar = useCallback(async (car) => {
        setSelectedCar(car);
        if (!car) { setLogs([]); return; }
        setLoadingLogs(true);
        try {
            const data = await getLogs(car.id);
            setLogs(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    const refreshLogs = useCallback(async () => {
        if (!selectedCar) return;
        try {
            const data = await getLogs(selectedCar.id);
            setLogs(data);
        } catch (e) {
            setError(e.message);
        }
    }, [selectedCar]);

    return (
        <div className="p-3 sm:p-4 w-full">
            <Title level={4} className="flex items-center gap-2 !text-base sm:!text-lg !mb-3">
                <CarOutlined className="text-green-600" /> EV Charge Tracker
            </Title>

            {error && (
                <Alert
                    type="error"
                    message={`Lỗi kết nối server: ${error}`}
                    closable
                    onClose={() => setError(null)}
                    className="mb-3"
                />
            )}

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size="small"
                items={[
                    {
                        key: 'tracker',
                        label: (
                            <span className="flex items-center gap-1">
                                <ThunderboltOutlined />
                                Theo dõi xe
                            </span>
                        ),
                        children: (
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Left: car list */}
                                <div className="w-full lg:w-64 shrink-0">
                                    {loadingCars ? (
                                        <div className="flex justify-center py-8">
                                            <Spin />
                                        </div>
                                    ) : (
                                        <EVCarManager
                                            cars={cars}
                                            onCarsChange={refreshCars}
                                            onSelectCar={handleSelectCar}
                                            selectedCarId={selectedCar?.id ?? null}
                                        />
                                    )}
                                </div>

                                {/* Right: log detail */}
                                <div className="flex-1 min-w-0">
                                    {loadingLogs ? (
                                        <div className="flex justify-center py-8">
                                            <Spin />
                                        </div>
                                    ) : selectedCar ? (
                                        <EVChargeLog
                                            key={selectedCar.id}
                                            car={selectedCar}
                                            logs={logs}
                                            onLogsChange={refreshLogs}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm border border-dashed rounded-lg">
                                            ← Chọn một xe để xem lịch sử sạc
                                        </div>
                                    )}
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'quick',
                        label: (
                            <span className="flex items-center gap-1">
                                <CalculatorOutlined />
                                Tính nhanh
                            </span>
                        ),
                        children: <EVQuickCalc />,
                    },
                ]}
            />
        </div>
    );
}
