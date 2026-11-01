import { useState, lazy, Suspense } from 'react';
import logo from '../../../public/assets/react.svg';
import { Modal, Spin } from 'antd';
import {
    ThunderboltOutlined,
    ExperimentOutlined,
    CarOutlined,
    MenuOutlined,
    CloseOutlined,
} from '@ant-design/icons';

const ElectricityCalculator = lazy(() => import('../../components/calculators/ElectricityCalculator'));
const WaterCalculator = lazy(() => import('../../components/calculators/WaterCalculator'));
const EVChargeCalculator = lazy(() => import('../../components/calculators/EVChargeCalculator'));

const TOOLS = {
    electricity: {
        key: 'electricity',
        label: 'Điện gia đình',
        icon: <ThunderboltOutlined className="text-yellow-500" />,
        component: ElectricityCalculator,
        title: 'Tính tiền điện gia đình',
    },
    water: {
        key: 'water',
        label: 'Nước gia đình',
        icon: <ExperimentOutlined className="text-blue-500" />,
        component: WaterCalculator,
        title: 'Tính tiền nước gia đình (Hà Nội)',
    },
    ev: {
        key: 'ev',
        label: 'Sạc xe điện',
        icon: <CarOutlined className="text-green-600" />,
        component: EVChargeCalculator,
        title: 'Tính thời gian sạc xe điện',
    },
};

function Header() {
    const [activeTool, setActiveTool] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const openTool = (key) => {
        setMobileOpen(false);
        setActiveTool(key);
    };
    const closeTool = () => setActiveTool(null);

    const ActiveComponent = activeTool ? TOOLS[activeTool].component : null;

    return (
        <>
            <header className="bg-gray-100 sticky top-0 z-50 shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="/">
                            <img src={logo} alt="Logo" className="h-8 w-8" />
                        </a>
                    </div>

                    {/* Desktop: 3 tool buttons */}
                    <ul className="hidden md:flex items-center gap-1">
                        {Object.values(TOOLS).map((tool) => (
                            <li key={tool.key}>
                                <button
                                    onClick={() => openTool(tool.key)}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors text-sm border-0 bg-transparent cursor-pointer"
                                    type="button"
                                >
                                    {tool.icon}
                                    <span>{tool.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Mobile: hamburger */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-md hover:bg-gray-200 transition-colors border-0 bg-transparent cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen
                                ? <CloseOutlined className="text-lg" />
                                : <MenuOutlined className="text-lg" />
                            }
                        </button>
                    </div>
                </nav>

                {/* Mobile menu dropdown */}
                {mobileOpen && (
                    <div className="md:hidden bg-gray-100 border-t border-gray-200 px-4 pb-4">
                        <ul className="flex flex-col gap-1 pt-2">
                            {Object.values(TOOLS).map((tool) => (
                                <li key={tool.key}>
                                    <button
                                        onClick={() => openTool(tool.key)}
                                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors text-sm border-0 bg-transparent cursor-pointer text-left"
                                    >
                                        {tool.icon}
                                        {tool.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </header>

            {/* Modal máy tính tiện ích — responsive width */}
            <Modal
                open={!!activeTool}
                onCancel={closeTool}
                footer={null}
                width="min(720px, 96vw)"
                style={{ top: 20 }}
                styles={{ body: { padding: '0 4px 4px', maxHeight: '80vh', overflowY: 'auto' } }}
                title={
                    activeTool ? (
                        <span className="flex items-center gap-2 text-base">
                            {TOOLS[activeTool].icon}
                            {TOOLS[activeTool].title}
                        </span>
                    ) : null
                }
                destroyOnClose
            >
                <Suspense fallback={<div className="flex justify-center py-8"><Spin size="large" /></div>}>
                    {ActiveComponent && <ActiveComponent />}
                </Suspense>
            </Modal>
        </>
    );
}

export default Header;
