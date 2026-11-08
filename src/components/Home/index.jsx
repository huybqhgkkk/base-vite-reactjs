import React, { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Spin } from 'antd';
import { ThunderboltOutlined, ExperimentOutlined, CarOutlined } from '@ant-design/icons';

const ElectricityCalculator = lazy(() => import('../calculators/ElectricityCalculator'));
const WaterCalculator = lazy(() => import('../calculators/WaterCalculator'));
const EVChargeCalculator = lazy(() => import('../calculators/EVChargeCalculator'));

const TABS = [
    {
        key: 'electricity',
        label: (
            <span className="flex items-center gap-1.5">
                <ThunderboltOutlined className="text-yellow-500" />
                <span>Điện gia đình</span>
            </span>
        ),
        component: ElectricityCalculator,
    },
    {
        key: 'water',
        label: (
            <span className="flex items-center gap-1.5">
                <ExperimentOutlined className="text-blue-500" />
                <span>Nước gia đình</span>
            </span>
        ),
        component: WaterCalculator,
    },
    {
        key: 'ev',
        label: (
            <span className="flex items-center gap-1.5">
                <CarOutlined className="text-green-600" />
                <span>Sạc xe điện</span>
            </span>
        ),
        component: EVChargeCalculator,
    },
];

const VALID_KEYS = TABS.map((t) => t.key);

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const activeKey = VALID_KEYS.includes(tabParam) ? tabParam : 'electricity';

    const handleChange = (key) => {
        setSearchParams({ tab: key });
    };

    const activeTab = TABS.find((t) => t.key === activeKey);
    const ActiveComponent = activeTab?.component;

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <Tabs
                activeKey={activeKey}
                onChange={handleChange}
                type="card"
                size="middle"
                items={TABS.map((tab) => ({ key: tab.key, label: tab.label }))}
            />
            <div className="border border-gray-200 rounded-b-lg rounded-tr-lg bg-white shadow-sm -mt-px">
                <Suspense
                    fallback={
                        <div className="flex justify-center py-12">
                            <Spin size="large" />
                        </div>
                    }
                >
                    {ActiveComponent && <ActiveComponent />}
                </Suspense>
            </div>
        </div>
    );
}
