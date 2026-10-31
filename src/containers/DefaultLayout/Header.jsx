import { useState, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../../public/assets/react.svg';
import { useTranslation } from 'react-i18next';
import { Select, Dropdown, Modal, Spin, Drawer } from 'antd';
import {
    ThunderboltOutlined,
    ExperimentOutlined,
    CarOutlined,
    ToolOutlined,
    DownOutlined,
    MenuOutlined,
    CloseOutlined,
} from '@ant-design/icons';

const { Option } = Select;

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

const NAV_LINKS = [
    { path: '/', key: 'home' },
    { path: '/post', key: 'post' },
    { path: '/counter', key: 'couter' },
    { path: '/my-form', key: 'form' },
];

function Header() {
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [activeTool, setActiveTool] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(null); // null | 'menu' | toolKey

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const openTool = (key) => {
        setMobileOpen(null);
        setActiveTool(key);
    };
    const closeTool = () => setActiveTool(null);

    const dropdownItems = Object.values(TOOLS).map((tool) => ({
        key: tool.key,
        label: (
            <span className="flex items-center gap-2">
                {tool.icon}
                {tool.label}
            </span>
        ),
        onClick: () => openTool(tool.key),
    }));

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

                    {/* Desktop nav */}
                    <ul className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ path, key }) => (
                            <li key={key}>
                                <a
                                    href={path}
                                    className={`${
                                        location.pathname === path ? 'bg-gray-200' : 'hover:bg-gray-200'
                                    } rounded-md px-3 py-2 transition-colors text-sm`}
                                >
                                    {t(key)}
                                </a>
                            </li>
                        ))}

                        {/* Tiện ích dropdown */}
                        <li>
                            <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
                                <button
                                    className="flex items-center gap-1 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors cursor-pointer border-0 bg-transparent text-sm"
                                    type="button"
                                >
                                    <ToolOutlined className="text-gray-600" />
                                    <span>Tiện ích</span>
                                    <DownOutlined className="text-xs text-gray-500" />
                                </button>
                            </Dropdown>
                        </li>

                        <li>
                            <Select
                                defaultValue={i18n.language}
                                style={{ width: 110 }}
                                size="small"
                                onChange={changeLanguage}
                            >
                                <Option value="en">English</Option>
                                <Option value="vi">Tiếng Việt</Option>
                            </Select>
                        </li>
                    </ul>

                    {/* Mobile: language + hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        <Select
                            defaultValue={i18n.language}
                            style={{ width: 90 }}
                            size="small"
                            onChange={changeLanguage}
                        >
                            <Option value="en">EN</Option>
                            <Option value="vi">VI</Option>
                        </Select>
                        <button
                            onClick={() => setMobileOpen(mobileOpen === 'menu' ? null : 'menu')}
                            className="p-2 rounded-md hover:bg-gray-200 transition-colors border-0 bg-transparent cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen === 'menu'
                                ? <CloseOutlined className="text-lg" />
                                : <MenuOutlined className="text-lg" />
                            }
                        </button>
                    </div>
                </nav>

                {/* Mobile menu dropdown */}
                {mobileOpen === 'menu' && (
                    <div className="md:hidden bg-gray-100 border-t border-gray-200 px-4 pb-4">
                        <ul className="flex flex-col gap-1 pt-2">
                            {NAV_LINKS.map(({ path, key }) => (
                                <li key={key}>
                                    <a
                                        href={path}
                                        onClick={() => setMobileOpen(null)}
                                        className={`${
                                            location.pathname === path ? 'bg-gray-200' : 'hover:bg-gray-200'
                                        } block rounded-md px-3 py-2 transition-colors text-sm`}
                                    >
                                        {t(key)}
                                    </a>
                                </li>
                            ))}
                            {/* Tools */}
                            <li className="pt-1 border-t border-gray-200 mt-1">
                                <p className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wide">Tiện ích</p>
                                {Object.values(TOOLS).map((tool) => (
                                    <button
                                        key={tool.key}
                                        onClick={() => openTool(tool.key)}
                                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-200 transition-colors text-sm border-0 bg-transparent cursor-pointer text-left"
                                    >
                                        {tool.icon}
                                        {tool.label}
                                    </button>
                                ))}
                            </li>
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
