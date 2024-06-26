import { useLocation } from 'react-router-dom';
import logo from '../../../public/assets/react.svg'; // replace with your logo image path
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';
const { Option } = Select;

function Header() {
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="bg-gray-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
                <div>
                    <a href="/">
                        <img src={logo} alt="Logo" className="h-8" />
                    </a>
                </div>
                <ul className="flex items-center space-x-4">
                    <li>
                        <a
                            href="/"
                            className={`${
                                location.pathname === '/' ? 'bg-gray-200' : ''
                            } rounded-md px-3 py-2`}
                        >
                            {t('home')}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/post"
                            className={`${
                                location.pathname === '/post' ? 'bg-gray-200' : ''
                            } rounded-md px-3 py-2`}
                        >
                            {t('post')}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/counter"
                            className={`${
                                location.pathname === '/counter' ? 'bg-gray-200' : ''
                            } rounded-md px-3 py-2`}
                        >
                            {t('couter')}
                        </a>
                    </li>
                    <li>
                        <a
                            href="/my-form"
                            className={`${
                                location.pathname === '/my-form' ? 'bg-gray-200' : ''
                            } rounded-md px-3 py-2`}
                        >
                            {t('form')}
                        </a>
                    </li>
                    <li>
                        <Select
                            defaultValue={i18n.language}
                            style={{ width: 120 }}
                            onChange={changeLanguage}
                        >
                            <Option value="en">English</Option>
                            <Option value="vi">Tiếng Việt</Option>
                        </Select>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
