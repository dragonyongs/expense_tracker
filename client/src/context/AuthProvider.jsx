// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // 여기에서 쿠키나 로컬 스토리지에서 토큰을 확인하여 인증 상태를 설정
        const token = localStorage.getItem('accessToken'); // 예시
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);
    
    const login = () => {
        setIsAuthenticated(true);
        // 로그인 후 토큰 저장 로직
    };

    const logout = () => {
        setIsAuthenticated(false);
        // 로그아웃 후 토큰 삭제 로직
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};