import { useEffect } from 'react';
import axios from '../services/axiosInstance';

const useFetchData = (url, setData) => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(url);
                setData(response.data);
            } catch (error) {
                console.error(`Error fetching data from ${url}:`, error);
            }
        };

        fetchData();
    }, [url, setData]);
};

export default useFetchData;