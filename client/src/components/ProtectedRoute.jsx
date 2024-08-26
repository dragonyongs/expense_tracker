import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const ProtectedRoute = ({ children, requiredRoles }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useContext(AuthContext);

    useEffect(() => {
        if (!isAuthenticated) {
            // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
            navigate('/signin');
        } else if (requiredRoles && !requiredRoles.includes(user.role)) {
            // 사용자 역할이 요구되는 역할에 포함되지 않으면 권한 없음
            navigate('/');
        }
    }, [isAuthenticated, navigate, requiredRoles, user]);

    // 인증된 경우와 역할이 일치하는 경우에만 children을 반환
    return isAuthenticated ? children : null;
};

export default ProtectedRoute;
