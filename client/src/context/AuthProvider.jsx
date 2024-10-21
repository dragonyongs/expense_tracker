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

    // const login = async (credentials) => {
    //     try {
    //         const { data } = await axios.post(`${API_URLS.AUTH_LOGIN}`, credentials);
    //         const response = await axios.post(`${API_URLS.AUTH_LOGIN}`, credentials);
    //         const { accessToken, refreshToken } = response.data;
            
    //         handleLoginSuccess(data);

    //           // 리프레시 토큰 저장
    //         localStorage.setItem('refreshToken', refreshToken);
    //     } catch (err) {
    //         const errorMessage = err.response?.data?.error || '로그인 중 문제가 발생했습니다. 다시 시도해주세요.';
    //         throw new Error(errorMessage);
    //     }
    // };

    const login = async (credentials) => {
        try {
            const { data } = await axiosInstance.post(`${API_URLS.AUTH_LOGIN}`, credentials);
            const { refreshToken, accessToken } = data;
    
            // 토큰 저장
            localStorage.setItem('refreshToken', refreshToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
            // 로그인 성공 처리
            setIsAuthenticated(true);
            setUser(data.user);

            const statusResponse = await axios.get(`${API_URLS.STATUSES}/${data.user.status_id}`);
            const status = statusResponse.data.status_name;

            navigate(status === 'pending' ? '/pending' : '/');
            // handleLoginSuccess(data);

        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // const handleLoginSuccess = async (data) => {
    //     // 로그인 성공 후 토큰 저장 및 사용자 정보 업데이트
    //     localStorage.setItem('refreshToken', data.refreshToken);
    //     const statusResponse = await axios.get(`${API_URLS.STATUSES}/${data.user.status_id}`);
    //     const status = statusResponse.data.status_name;

    //     // 상태와 토큰 설정
    //     localStorage.setItem('status', status);
    //     axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

    //     // 인증 상태와 사용자 정보 업데이트
    //     setIsAuthenticated(true);
    //     setUser({ ...data.user, status });

    //     // 상태에 따른 리디렉션
    //     navigate(status === 'pending' ? '/pending' : '/');
    // };

    // const deleteAllCookies = () => {
    //     document.cookie.split(";").forEach((cookie) => {
    //         const name = cookie.split("=")[0].trim();
    //         document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    //     });
    // };

    // const logout = async () => {

    //     const refreshToken = localStorage.getItem('refreshToken');
    //     console.log('Logging out with refreshToken:', refreshToken);

    //     try {
    //         // 서버에 로그아웃 요청
    //         await axios.post(`${API_URLS.AUTH_LOGOUT}`, { refreshToken: localStorage.getItem('refreshToken') });
            
    //         // 로컬 스토리지에서 토큰 제거
    //         localStorage.removeItem('refreshToken');
    //         localStorage.removeItem('status');

    //         // 쿠키 삭제
    //         deleteAllCookies();

    //         // 인증 상태와 사용자 정보 초기화
    //         setIsAuthenticated(false);
    //         setUser(null);

    //         // Axios 기본 헤더 제거
    //         delete axios.defaults.headers.common['Authorization'];

    //         // 로그인 페이지로 리디렉션
    //         navigate('/signin');
    //     } catch (err) {
    //         console.error('Logout Error: ', err);
    //         if (err.response && err.response.status === 401) {
    //             // 유효하지 않은 리프레시 토큰일 경우 강제 로그아웃 처리
    //             localStorage.removeItem('refreshToken'); // 토큰 제거
    //             localStorage.removeItem('status'); // 상태 제거
    //             deleteAllCookies(); // 쿠키 삭제
    //             setIsAuthenticated(false); // 인증 상태 초기화
    //             setUser(null); // 사용자 정보 초기화
    //             navigate('/signin'); // 로그인 페이지로 이동
    //         }
    //     }
    // };

    const logout = async () => {
        try {
            await axiosInstance.post(`${API_URLS.AUTH_LOGOUT}`, { refreshToken: localStorage.getItem('refreshToken') });
    
            // 로그아웃 처리
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('status');
            setIsAuthenticated(false);
            setUser(null);
    
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
}
