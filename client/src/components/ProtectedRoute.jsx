// components/ProtectedRoute.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    console.log('ProtectedRoute');

    useEffect(() => {
        if (!isAuthenticated) {
            console.log('!isAuthenticated');
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    // 인증된 경우 children을 반환
    return isAuthenticated ? children : null; // 또는 다른 로딩 상태를 반환할 수도 있음
};

export default ProtectedRoute;
