import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL || '/';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, 
});

// 인터셉터 설정: 요청 전에 액세스 토큰을 헤더에 추가
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 인터셉터 설정: 응답에서 401 에러가 발생하면 리프레시 토큰으로 재시도
// axiosInstance.interceptors.response.use((response) => {
//     return response;
// }, async (error) => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;
        
//         // 리프레시 토큰으로 액세스 토큰을 갱신
//         try {
//             const refreshToken = localStorage.getItem('refreshToken');
//             const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
//             const newAccessToken = data.accessToken;

//             // 새로운 액세스 토큰을 저장하고 다시 시도
//             localStorage.setItem('accessToken', newAccessToken);
//             axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;


//             return axiosInstance(originalRequest); // 실패한 요청 재시도
//         }   catch (refreshError) {
//             console.error('토큰 갱신 실패:', refreshError);
            
//             // 만약 리프레시 토큰도 유효하지 않다면 (403 또는 401), 로그아웃 처리
//             if (refreshError.response && refreshError.response.status === 401) {
//                 localStorage.removeItem('accessToken');
//                 localStorage.removeItem('refreshToken');
//                 window.location.href = '/login'; // 로그인 페이지로 리다이렉트
//             }
        
//             return Promise.reject(refreshError);
//         }
    
//     }

//     return Promise.reject(error);
// });

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        const navigate = useNavigate();

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { data } = await axiosInstance.post('/api/auth/refresh-token', {
                    refreshToken: localStorage.getItem('refreshToken')
                });

                // New access token received, retry original request
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh token invalid, log out
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('status');
                navigate('/signin');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
