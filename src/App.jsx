import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Header = lazy(() => import('./containers/DefaultLayout/Header.jsx'));
const Home = lazy(() => import('./components/Home'));
const Post = lazy(() => import('./components/Post'));
const MyForm = lazy(() => import('./components/testAntd/myForm.jsx'));
const Counter = lazy(() => import('./components/testRedux/counter.jsx'));
const NotFound = lazy(() => import('./components/NotFound'));

import 'antd/dist/reset.css';
import 'tailwindcss/tailwind.css';
import './styles/App.css';
import { Spin } from 'antd';

function App() {
    return (
        <div className="max-w-screen-xl mx-auto">
            <Router>
                <Suspense fallback={<Spin fullscreen size="large" />}>
                    <Header />
                    <Routes>
                        <Route exact path="/" element={<Home />} />
                        <Route path="/post" element={<Post />} />
                        <Route path="/my-form" element={<MyForm />} />
                        <Route path="/counter" element={<Counter />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}

export default App;
