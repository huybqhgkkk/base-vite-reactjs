import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/assets/react.svg';
import {
    ThunderboltOutlined,
    ExperimentOutlined,
    CarOutlined,
    MenuOutlined,
    CloseOutlined,
} from '@ant-design/icons';

const TOOLS = [
    {
        key: 'electricity',
        label: 'Điện gia đình',
        icon: <ThunderboltOutlined className="text-yellow-500" />,
    },
    {
        key: 'water',
        label: 'Nước gia đình',
        icon: <ExperimentOutlined className="text-blue-500" />,
    },
    {
        key: 'ev',
        label: 'Sạc xe điện',
        icon: <CarOutlined className="text-green-600" />,
    },
];

function Header() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const goToTool = (key) => {
        setMobileOpen(false);
        navigate(`/?tab=${key}`);
    };

    return (
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
                    {TOOLS.map((tool) => (
                        <li key={tool.key}>
                            <button
                                onClick={() => goToTool(tool.key)}
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

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="md:hidden bg-gray-100 border-t border-gray-200 px-4 pb-4">
                    <ul className="flex flex-col gap-1 pt-2">
                        {TOOLS.map((tool) => (
                            <li key={tool.key}>
                                <button
                                    onClick={() => goToTool(tool.key)}
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
    );
}

export default Header;
