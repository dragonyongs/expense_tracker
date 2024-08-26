// context/AuthProvider.jsx
import React, { createContext, useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth/isAuthenticated');
                const fetchedUser = response.data.user;
                const statusResponse = await axios.get(`/api/status/${fetchedUser.status_id}`);
                const status = statusResponse.data.status_name;

                setUser({ ...fetchedUser, status });
                setIsAuthenticated(true);

                if (status === 'pending') {
                    if (window.location.pathname !== '/pending') {
                        navigate('/pending');
                    }
                } else if (window.location.pathname === '/pending' && status === 'approved' || window.location.pathname === '/signin' && status) {
                    navigate('/');
                }

            } catch (err) {
                handleAuthError(err);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, [navigate]);

    const handleAuthError = (err) => {
        if (err.response && err.response.status === 401) {
            setIsAuthenticated(false);
            setUser(null);
        } else {
            console.error(err);
        }
    };

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/api/auth/login', credentials);
            handleLoginSuccess(data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || '로그인 중 문제가 발생했습니다. 다시 시도해주세요.';
            throw new Error(errorMessage);
        }
    };

    const handleLoginSuccess = async (data) => {
        localStorage.setItem('refreshToken', data.refreshToken);
        const statusResponse = await axios.get(`/api/status/${data.user.status_id}`);
        const status = statusResponse.data.status_name;
        localStorage.setItem('status', status);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        setIsAuthenticated(true);
        setUser({ ...data.user, status });

        navigate(status === 'pending' ? '/pending' : '/');
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            setUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
}
