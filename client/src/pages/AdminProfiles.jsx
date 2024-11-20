import React, { useEffect, useState } from 'react';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import AdminHeader from '../components/AdminHeader';
import SearchInput from '../components/SearchInput';
import AdminProfileDrawer from '../components/AdminProfileDrawer';

import { TbAddressBookOff, TbCalendarOff, TbPhoneOff } from "react-icons/tb";

function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [seletedProfile, isSelectedProfile] = useState({});

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

    const handleOpenDrawer = (profile) => {

        console.log(profile);
        isSelectedProfile(profile);
        setIsProfileOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsProfileOpen(false);
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
                            const isPhones = profile.phones.length;
                            const isAddress = profile.phones.length;
                            const isDates = profile.phones.length;

                            return (
                                <li key={profile._id} onClick={() => handleOpenDrawer(profile)} className={`flex items-center gap-x-4 py-3 px-6 sm:py-4 cursor-pointer active:bg-gray-50 dark:active:bg-slate-500 dark:text-slate-300 ${formerEmployee && 'bg-gray-100'}`}>
                                    <span className={`flex-1 ${formerEmployee && 'text-gray-400'}`}>{profile?.member_id?.member_name}</span>
                                    {!isPhones && !isAddress && !isDates &&
                                    <div className={`flex justify-between gap-x-4 ${formerEmployee && 'text-gray-400' }`}>
                                        {!isPhones && (isPhones < 1) && <span className='flex gap-x-1 items-center'><TbPhoneOff /></span>}
                                        {!isAddress && (isAddress < 1) &&  <span className='flex gap-x-1 items-center'><TbAddressBookOff /></span>}
                                        {!isDates && (isDates < 1) &&  <span className='flex gap-x-1 items-center'><TbCalendarOff /></span>}
                                    </div> }
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <AdminProfileDrawer
                isOpen={isProfileOpen}
                title={"프로필 관리"}
                onClose={handleCloseDrawer}
            >
                <h1>{seletedProfile?.member_id?.member_name}</h1>
                <p>{seletedProfile?.member_id?.email}</p>  

                <div className="mt-4">
                    <h2 className="text-lg font-semibold">전화번호</h2>
                    {seletedProfile?.phones?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {seletedProfile.phones.map((phone) => (
                                <li key={phone._id}>
                                    {`${phone.phone_type}: ${phone.phone_number}${phone.extension ? ` (내선: ${phone.extension})` : ''}`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">등록된 전화번호가 없습니다.</p>
                    )}
                </div>

                <div className="mt-4">
                    <h2 className="text-lg font-semibold">주소</h2>
                    {seletedProfile?.addresses?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {seletedProfile.addresses.map((address) => (
                                <li key={address._id}>
                                    {`${address.address_type}: ${address.address_line1}, ${address.address_line2}, ${address.postal_code}`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">등록된 주소가 없습니다.</p>
                    )}
                </div>

                <div className="mt-4">
                    <h2 className="text-lg font-semibold">입사일</h2>
                    {seletedProfile?.dates?.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                            {seletedProfile.dates.map((date) => (
                                <li key={date._id}>
                                    {`${date.date_type}: ${new Date(date.date).toLocaleDateString('ko-KR')}`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">등록된 입사일 정보가 없습니다.</p>
                    )}
                </div>
            </AdminProfileDrawer>

        </>
    );
}

export default AdminProfiles;
