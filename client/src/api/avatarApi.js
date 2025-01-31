import axios from "../services/axiosInstance"; 
import { API_URLS } from '../services/apiUrls';

export const getAvatar = async (memberId) => {
    try {
        const response = await axios.get(`${API_URLS.AVATARS}/${memberId}`);
        return response.data || {}; // 결과 값이 없으면 빈 객체 반환
    } catch (error) {
        if (error.response) {
            // 404 Not Found 에러 처리
            if (error.response.status === 404) {
                throw new Error(`Avatar not found for member ID: ${memberId}`);
            }
            // 다른 에러 처리
            throw new Error(error.response.data.error || 'An error occurred');
        } else {
            // 네트워크 오류 등
            throw new Error('Network error occurred');
        }
    }
};
