import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import { AuthContext } from './context/AuthProvider';

import './App.css';

const App = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />} />
            <Route path="/*" element={<NotFound />} />
        </Routes>
    );
};

export default App;
