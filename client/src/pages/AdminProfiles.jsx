import React, { useEffect, useState } from 'react';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import AdminHeader from '../components/AdminHeader';
import SearchInput from '../components/SearchInput';
import AdminProfileDrawer from '../components/AdminProfileDrawer';
import ProfileEditDrawer from '../components/ProfileEditDrawer';
import { TbAddressBookOff, TbCalendarOff, TbPhoneOff } from "react-icons/tb";
import { filterDataBySearchTerm } from '../utils/search';
import AvatarPreview from '../components/AvatarPreview';

function AdminProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [avatar, setAvatar] = useState({});
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [filteredProfiles, setFilteredProfiles] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    
    const fetchProfiles = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(API_URLS.PROFILES);
            setProfiles(data);
            setFilteredProfiles(data);

            if (selectedProfile) {
                const updatedProfile = data.find(profile => profile._id === selectedProfile._id);
                if (updatedProfile) {
                    setSelectedProfile(updatedProfile);
                }
            }
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProfiles();
    }, [isEditDrawerOpen]);

    const handleSearch = (field, term) => {
        const filtered = filterDataBySearchTerm(profiles, field, term);
        setFilteredProfiles(filtered);
    };

    const handleOpenDrawer = (profile) => {
        setSelectedProfile(profile);
        setAvatar(profile.avatar_id);
        setIsProfileOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsProfileOpen(false);
    };

    const handleOpenEditDrawer = (profile) => {
        setSelectedProfile(profile);
        setIsEditDrawerOpen(true);
    };

    const handleCloseEditDrawer = () => {
        setIsEditDrawerOpen(false);
    };

    const handleSave = () => {
        try {
            handleCloseEditDrawer();
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    return (
        <>
            <AdminHeader />
            <div className='flex flex-col pt-4 px-4 pb-24 justify-center mt-4'>
                <div className='flex justify-center mb-4'>
                    <SearchInput onSearch={handleSearch} className="w-full max-w-md" />
                </div>
                <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-slate-700">
                    <ul className='flex flex-col divide-y divide-gray-200 dark:divide-gray-600'>
                        {filteredProfiles.map(profile => {
                            const formerEmployee = profile?.member_id?.role_id?.role_name === 'former_employee';

                            const hasPhones = Array.isArray(profile.phones) && profile.phones.length > 0;
                            const hasAddresses = Array.isArray(profile.addresses) && profile.addresses.length > 0;
                            const hasDates = Array.isArray(profile.dates) && profile.dates.length > 0;

                            const entryDate = profile.dates?.find(date => date.date_type === 'entry')?.date;
                            const formattedEntryDate = entryDate
                                ? new Date(entryDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
                                : null;
                            const isFutureDate = entryDate && new Date(entryDate) > new Date();

                            return (
                                <li
                                    key={profile._id}
                                    onClick={() => handleOpenDrawer(profile)}
                                    className={`flex items-center gap-x-4 py-3 px-4 sm:py-4 sm:px-6 cursor-pointer active:bg-gray-50 dark:active:bg-slate-500 dark:text-slate-300 ${formerEmployee && 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'}`}
                                >
                                    <span className="flex-1 text-sm sm:text-base">
                                        {profile?.member_id?.member_name}
                                        {isFutureDate && formattedEntryDate && (
                                            <span className="ml-2 text-blue-500 text-sm font-normal">
                                                ({`입사 예정일: ${formattedEntryDate}`})
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex justify-between items-center gap-x-2">
                                        {!hasPhones && <span className='flex gap-x-1 items-center text-lg'><TbPhoneOff /></span>}
                                        {!hasAddresses && <span className='flex gap-x-1 items-center text-lg'><TbAddressBookOff /></span>}
                                        {!hasDates && <span className='flex gap-x-1 items-center text-lg'><TbCalendarOff /></span>}
                                    </div>
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
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                    <AvatarPreview avatarConfig={avatar} shape="circle" /> 
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedProfile?.member_id?.member_name}</h2>
                        <p className="text-gray-600">{selectedProfile?.member_id?.email}</p>
                    </div>
                </div>

                {/* Phone Numbers */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">연락처</h3>
                    </div>
                    {selectedProfile?.phones?.length > 0 ? (
                        <div className="space-y-2">
                            {selectedProfile.phones.map((phone) => (
                                <div key={phone._id} className="flex justify-between items-center">
                                    <span className="text-gray-600">{phone.phone_name}</span>
                                    <span className="text-gray-900">
                                        {phone.phone_number}
                                        {phone.extension && <span className="text-gray-500 ml-1">({phone.extension})</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">등록된 전화번호가 없습니다.</p>
                    )}
                </div>

                {/* Addresses */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">주소</h3>
                    </div>
                    {selectedProfile?.addresses?.length > 0 ? (
                        <div className="space-y-2">
                            {selectedProfile.addresses.map((address) => (
                                <div key={address._id} className="flex justify-between items-center">
                                    <span className="text-gray-600">{address.address_name}</span>
                                    <p className="text-gray-900 mt-1">
                                        {address.address_line1}, {address.address_line2}
                                        <span className="text-gray-500 ml-1">({address.postal_code})</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">등록된 주소가 없습니다.</p>
                    )}
                </div>

                {/* Important Dates */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="font-semibold text-gray-900">기념일</h3>
                    </div>
                    {selectedProfile?.dates?.length > 0 ? (
                        <div className="space-y-2">
                            {selectedProfile.dates.map((date) => (
                                <div key={date._id} className="flex justify-between items-center">
                                    <span className="text-gray-600">{date.date_name}</span>
                                    <span className="text-gray-900">
                                        {new Date(date.date).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">등록된 기념일이 없습니다.</p>
                    )}
                </div>

                {/* Edit Button */}
                <button 
                    onClick={() => handleOpenEditDrawer(selectedProfile)} 
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                    프로필 수정
                </button>
            </AdminProfileDrawer>
            <ProfileEditDrawer
                isOpen={isEditDrawerOpen}
                title={"프로필 편집"}
                memberId={selectedProfile?.member_id?._id}
                profileId={selectedProfile?._id}
                userData={selectedProfile}
                onSave={handleSave}
                onClose={handleCloseEditDrawer}
            />
        </>
    );
}

export default AdminProfiles;
