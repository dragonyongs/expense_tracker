import axios from "../services/axiosInstance"; 
import { API_URLS } from '../services/apiUrls';

export const getAvatar = async (memberId) => {
    try {
        const response = await axios.get(`${API_URLS.AVATARS}/${memberId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.error);
    }
};