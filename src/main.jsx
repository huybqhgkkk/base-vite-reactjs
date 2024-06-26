import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n.jsx';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store.jsx';
import './styles/index.css';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </Provider>
);