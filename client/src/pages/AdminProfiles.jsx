import React, { useEffect, useState } from 'react';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import AdminHeader from '../components/AdminHeader';
import SearchInput from '../components/SearchInput';

function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProfiles = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get(API_URLS.PROFILES);
                setProfiles(data);
                setFilteredProfiles(data); // 초기 필터링된 데이터는 전체 데이터
            } catch (error) {
                console.error("Error fetching profiles:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    const handleSearch = (field, term) => {
        const lowerTerm = term.toLowerCase();
    
        const filtered = profiles.filter((profile) => {
            const value = getNestedValue(profile, field);
            return value?.toString().toLowerCase().includes(lowerTerm);
        });
    
        setFilteredProfiles(filtered);
    };
    
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => {
            if (!acc) return null; // 값이 없으면 중단
            if (Array.isArray(acc)) {
                return acc.map(item => item[part]).filter(Boolean).join(', ');
            }
            return acc[part]; // 객체의 키 값 반환
        }, obj);
    };

    return (
        <>
            <AdminHeader />
            <div className='flex flex-col p-4 justify-center mt-8'>
                <SearchInput onSearch={handleSearch} />
                <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-slate-700">
                    <ul className='flex flex-col divide-y divide-gray-200 dark:divide-gray-600'>
                        {filteredProfiles.map(profile => {
                            const formerEmployee = profile?.member_id?.role_id?.role_name === 'former_employee';
                            return (
                                <li key={profile._id} className={`flex items-center gap-x-4 p-3 sm:p-4 cursor-pointer active:bg-gray-50 dark:active:bg-slate-500 dark:text-slate-300 ${formerEmployee && 'bg-gray-100'}`}>
                                    <span className={`${formerEmployee && 'text-gray-400'}`}>{profile?.member_id?.member_name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default AdminProfiles;
