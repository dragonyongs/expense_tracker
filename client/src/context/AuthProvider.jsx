// context/AuthProvider.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // 초기값 null (로딩 상태)
    const [user, setUser] = useState(null); // 사용자 정보 상태
    const [loading, setLoading] = useState(true); // 로딩 상태

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth/isAuthenticated');
                const fetchedUser = response.data.user;

                // status_id를 사용해 status_name 가져오기
                const statusResponse = await axios.get(`/api/status/${fetchedUser.status_id}`);
                const status = statusResponse.data.status_name;  // status_name 가져오기

                setUser({ ...fetchedUser, status: status });  // user 상태에 status 추가
                setIsAuthenticated(true);

                // 승인 상태에 따라 리다이렉트
                if (status === 'pending') {
                    if (location.pathname !== '/pending') {
                        navigate('/pending');
                    }
                } else if (location.pathname === '/pending' && status === 'approved' || location.pathname === '/signin') {
                    navigate('/');
                }

            } catch (err) {
                handleAuthError(err);
            } finally {
                setLoading(false); // API 호출이 끝나면 로딩 상태를 false로 설정
            }
        };

        // 페이지 로드 시 인증 상태 확인
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
            // 서버로부터의 에러 응답이 존재하는 경우 해당 메시지를 추출
            if (err.response && err.response.data && err.response.data.error) {
                throw new Error(err.response.data.error);  // 에러 메시지를 추출하여 throw
            } else {
                throw new Error('로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    const handleLoginSuccess = async (data) => {
        localStorage.setItem('refreshToken', data.refreshToken);
        // status_id를 사용해 status_name 가져오기
        const statusResponse = await axios.get(`/api/status/${data.user.status_id}`);
        const status = statusResponse.data.status_name;

        localStorage.setItem('status', status);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        setIsAuthenticated(true);
        setUser({ ...data.user, status: status });

        // 로그인 후 승인 상태에 따른 리다이렉트
        if (status === 'pending') {
            navigate('/pending');
        } else {
            navigate('/'); // 승인된 경우 홈으로 이동
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
            {loading ? (
                <div className='flex justify-center items-center w-full h-full'>
                    <h2 className='text-2xl font-bold'>로딩 중...</h2>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}
