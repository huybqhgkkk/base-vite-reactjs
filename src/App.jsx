import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './containers/DefaultLayout/Header.jsx';
import Home from './components/Home/index.jsx';
import Post from './components/Post/index.jsx';
import MyForm from './components/testAntd/myForm.jsx';
import Counter from './components/testRedux/counter.jsx';
import NotFound from './components/NotFound/index.jsx';

import 'antd/dist/reset.css';
import 'tailwindcss/tailwind.css';
import './styles/App.css';


function App() {
    return (
        <div className="max-w-screen-xl mx-auto">
            <Router>
                <Header />

                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route path="/post" element={<Post />} />
                    <Route path="/my-form" element={<MyForm />} />
                    <Route path="/counter" element={<Counter />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
