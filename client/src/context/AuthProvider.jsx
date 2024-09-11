import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);  // 기본 값 false
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth/isAuthenticated');
                const fetchedUser = response.data.user;

                // 사용자 상태 확인
                const statusResponse = await axios.get(`/api/status/${fetchedUser.status_id}`);
                const status = statusResponse.data.status_name;

                // role_id가 null일 경우 예외 처리
                if (!fetchedUser.role_id) {
                    throw new Error("User does not have a valid role_id.");
                }

                const roleResponse = await axios.get(`/api/roles/${fetchedUser.role_id}`);
                const role = roleResponse.data.role_name;

                // 사용자와 상태 정보 업데이트
                setUser({ ...fetchedUser, status, role });
                setIsAuthenticated(true);

                // 상태에 따라 리디렉션
                if (status === 'pending') {
                    if (window.location.pathname !== '/pending') {
                        navigate('/pending');
                    }
                } else if (status === 'approved' && (window.location.pathname === '/pending' || window.location.pathname === '/signin')) {
                    navigate('/');
                }

            } catch (err) {
                handleAuthError(err);
            } finally {
                setLoading(false);  // 로딩 상태 업데이트
            }
        };

        checkAuthStatus();
    }, [navigate]);

    const handleAuthError = (err) => {
        if (err.response && err.response.status === 401) {
            setIsAuthenticated(false);
            setUser(null);
        } else {
            console.error('Auth Error: ', err);
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
        // 로그인 성공 후 토큰 저장 및 사용자 정보 업데이트
        localStorage.setItem('refreshToken', data.refreshToken);
        const statusResponse = await axios.get(`/api/status/${data.user.status_id}`);
        const status = statusResponse.data.status_name;

        // 상태와 토큰 설정
        localStorage.setItem('status', status);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

        // 인증 상태와 사용자 정보 업데이트
        setIsAuthenticated(true);
        setUser({ ...data.user, status });

        // 상태에 따른 리디렉션
        navigate(status === 'pending' ? '/pending' : '/');
    };

    const logout = async () => {
        try {
            // 서버에 로그아웃 요청
            await axios.post('/api/auth/logout', { refreshToken: localStorage.getItem('refreshToken') });
            
            // 로컬 스토리지에서 토큰 제거
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('status');

            // 인증 상태와 사용자 정보 초기화
            setIsAuthenticated(false);
            setUser(null);

            // Axios 기본 헤더 제거
            delete axios.defaults.headers.common['Authorization'];

            // 로그인 페이지로 리디렉션
            navigate('/signin');
        } catch (err) {
            console.error('Logout Error: ', err);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
}
