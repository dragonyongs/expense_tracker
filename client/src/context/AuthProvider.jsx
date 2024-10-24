import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../components/Loading';
import { API_URLS } from '../services/apiUrls';
import axiosInstance from '../services/axiosInstance';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);  // 기본 값 false
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get(`${API_URLS.AUTHENTICATED}`);
                const fetchedUser = response.data.user;

                // 사용자 상태 확인
                const statusResponse = await axios.get(`${API_URLS.STATUSES}/${fetchedUser.status_id}`);
                const status = statusResponse.data.status_name;

                // role_id가 null일 경우 예외 처리
                if (!fetchedUser.role_id) {
                    throw new Error("User does not have a valid role_id.");
                }

                const roleResponse = await axios.get(`${API_URLS.ROLES}/${fetchedUser.role_id}`);
                const role = roleResponse.data.role_name;

                const positionResponse = await axios.get(`${API_URLS.MEMBERS}/${fetchedUser.member_id}`);
                const position = positionResponse.data.position;

                // 사용자와 상태 정보 업데이트
                setUser({ ...fetchedUser, status, role, position });
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
            const { data } = await axiosInstance.post(`${API_URLS.AUTH_LOGIN}`, credentials);
            const { accessToken, refreshToken } = data; // 리프레시 토큰도 포함

            // 액세스 토큰을 헤더에 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // 서비스 워커에 액세스 토큰 전달
            navigator.serviceWorker.ready.then(registration => {
                registration.active.postMessage({ action: 'setToken', token: accessToken });
            });

            // 리프레시 토큰을 저장 (로컬 스토리지나 쿠키에)
            localStorage.setItem('refreshToken', refreshToken);

            // 로그인 성공 처리
            setIsAuthenticated(true);
            setUser(data.user);

            const statusResponse = await axios.get(`${API_URLS.STATUSES}/${data.user.status_id}`);
            const status = statusResponse.data.status_name;

            // 상태에 따라 리다이렉션
            navigate(status === 'pending' ? '/pending' : '/');
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || '로그인 실패');
            } else {
                throw new Error('네트워크 오류 또는 서버 문제');
            }
        }
    };

    const logout = async () => {
        try {
            // 로컬 스토리지에서 리프레시 토큰 가져오기
            const refreshToken = localStorage.getItem('refreshToken');
    
            if (!refreshToken) {
                console.error('리프레시 토큰이 없습니다.');
                return;
            }
    
            // 서버에 로그아웃 요청 보내기
            await axios.post(`${API_URLS.AUTH_LOGOUT}`, { refreshToken });
    
            // 로그아웃 후 처리
            localStorage.removeItem('refreshToken'); // 리프레시 토큰 삭제
            localStorage.removeItem('status'); // 상태 정보 삭제
            setIsAuthenticated(false);
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error.response ? error.response.data : error.message);
        }
    };
    
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
}