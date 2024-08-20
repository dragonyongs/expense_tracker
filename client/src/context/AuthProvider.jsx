// context/AuthProvider.jsx

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(null);  // 초기값 null (로딩 상태를 나타내기 위함)
    const [user, setUser] = useState(null);  // 사용자 정보 상태
    const [loading, setLoading] = useState(true); // 추가된 로딩 상태

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth/isAuthenticated');
                setIsAuthenticated(true);
                setUser(response.data.user);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setIsAuthenticated(false);
                    setUser(null);
                    // 추가적으로 사용자에게 로그인 필요 메시지를 보여줄 수 있음
                } else {
                    console.error(err);
                }
            } finally {
                setLoading(false); // API 호출이 끝나면 로딩 상태를 false로 설정
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await axios.post('/api/auth/login', credentials);
            localStorage.setItem('refreshToken', data.refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            setIsAuthenticated(true);
            setUser(data.user);
        } catch (err) {
            console.error(err);
        }
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
            {loading ? <div className='flex justify-center items-center w-full h-full'>
                <h2 className='text-2xl font-bold'>로딩 중...</h2>
            </div> : children}
        </AuthContext.Provider>
    );
}