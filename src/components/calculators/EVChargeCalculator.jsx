import React, { useState, useCallback } from 'react';
import { Tabs, Typography } from 'antd';
import { CarOutlined, ThunderboltOutlined, CalculatorOutlined } from '@ant-design/icons';
import EVCarManager from './EVCarManager';
import EVChargeLog from './EVChargeLog';
import EVQuickCalc from './EVQuickCalc';
import { getCars, getLogs } from './evStorage';

const { Title } = Typography;

export default function EVChargeCalculator() {
    const [cars, setCars] = useState(() => getCars());
    const [selectedCar, setSelectedCar] = useState(null);
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('tracker');

    const refreshCars = useCallback(() => {
        const updated = getCars();
        setCars(updated);
        // keep selectedCar in sync
        if (selectedCar) {
            const found = updated.find((c) => c.id === selectedCar.id);
            setSelectedCar(found ?? null);
            if (found) setLogs(getLogs(found.id));
            else setLogs([]);
        }
    }, [selectedCar]);

    const handleSelectCar = useCallback((car) => {
        setSelectedCar(car);
        setLogs(car ? getLogs(car.id) : []);
    }, []);

    const refreshLogs = useCallback(() => {
        if (selectedCar) setLogs(getLogs(selectedCar.id));
    }, [selectedCar]);

    return (
        <div className="p-3 sm:p-4 w-full">
            <Title level={4} className="flex items-center gap-2 !text-base sm:!text-lg !mb-3">
                <CarOutlined className="text-green-600" /> EV Charge Tracker
            </Title>

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
                                    <EVCarManager
                                        cars={cars}
                                        onCarsChange={refreshCars}
                                        onSelectCar={handleSelectCar}
                                        selectedCarId={selectedCar?.id ?? null}
                                    />
                                </div>

                                {/* Right: log detail */}
                                <div className="flex-1 min-w-0">
                                    {selectedCar ? (
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
