import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { AvatarContext } from '../context/AvatarContext';
import AvatarPreview from '../components/AvatarPreview';
import { MutatingDots } from 'react-loader-spinner';
import { LuBuilding, LuSmartphone, LuCake } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { TbUserEdit } from "react-icons/tb";
import { renderContactIcon, renderContactLabel, renderDateIcon, renderDateLabel, renderAddressIcon, renderAddressLabel } from '../utils/profileRenderUtils';
import { formatDateToKorean, isTodayBirthday, calculateYearsSinceEntry } from '../utils/dateUtils';
import { AiOutlineHistory } from "react-icons/ai";

import axios from "../services/axiosInstance"; 
import { API_URLS } from '../services/apiUrls';
import ProfileEditDrawer from '../components/ProfileEditDrawer';
import PasswordChangeDrawer from '../components/profile/PasswordChangeDrawer';
import useProfileData from '../hooks/useProfileData';

const Profile = () => {
    const { avatarConfig } = useContext(AvatarContext);
    const [ profileData, setProfileData ] = useState({});
    const { user } = useContext(AuthContext);
    const [successMsg, setSuccessMsg] = useState('');
    const [errMsg, setErrMsg] = useState('');

    // 초기 상태 정의
    const [isOpen, setIsOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const memberId = user.member_id;

    const { 
        personalContact,
        companyContact,
        data, 
        isLoading,
        error, 
        fetchProfileData, 
    } = useProfileData(memberId);

    useEffect( () => {
        const loadProfileData = async () => {
            const result = await fetchProfileData();
            setProfileData(result);
        };
    
        loadProfileData();
    }, [isOpen]);

    if (error) return <div>{error}</div>;

    const handleOpenDrawer = () => {
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    const handleOpenPasswordDrawer = () => {
        setIsPasswordOpen(true);
    }
    
    const handleClosePasswordChangeDrawer = () => {
        setErrMsg('');
        setSuccessMsg('');
        setIsPasswordOpen(false);
    };

    const birthdayDates = data.dates.filter(date => date.date_type === 'birthday');

    const { years, days } = calculateYearsSinceEntry(data.dates);

    const handleSave = async () => {
        try {
            await fetchProfileData();
        } catch (error) {
            console.error("저장 중 오류 발생:", error);
        }
    };

    const handlePasswordChange = async (newPassword, currentPassword) => {
        try {
            const response = await axios.put(`${API_URLS.MEMBERS}/${memberId}/change-password`, {
                currentPassword,
                newPassword,
            });
            
            if (response.data.success) {
                setSuccessMsg('비밀번호가 성공적으로 변경되었습니다.');
            } else {
                throw new Error('비밀번호 변경 실패');
            }
        } catch (error) {
            setErrMsg(error.response?.data?.error || '비밀번호 변경에 실패했습니다.');
        }
    };

    return (
        <>
            <div className={`transition-all ${isOpen && 'pt-4 dark:bg-slate-800'}`}>
                <header className={`flex justify-between items-center py-4 pl-6 pr-3 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                    <div className='text-2xl' >
                        <span className='font-semibold'>프로필</span>
                    </div>
                </header>
                <div className='flex flex-col gap-y-3 px-4 pb-4 dark:bg-slate-800'>
                    <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                        {isLoading ? ( 
                                <div className="flex flex-col items-center justify-center">
                                    <MutatingDots
                                        visible={true}
                                        height="100"
                                        width="100"
                                        color="#b8a57f"
                                        secondaryColor="#0433FF"
                                        radius="12.5"
                                        ariaLabel="mutating-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className='absolute top-6 right-6 flex gap-x-1 items-center text-md text-slate-500'>
                                    {days > 0 && <AiOutlineHistory className='w-5 h-5'/> }
                                    {years >= 2 
                                            ? `입사 ${years}년차` 
                                            : (days > 0 && `입사 ${days}일차`)}
                                    </div>
                                    <div className='flex justify-center items-center w-24 h-24 bg-slate-100 rounded-xl overflow-hidden'>
                                        <AvatarPreview avatarConfig={avatarConfig} shape="rounded" /> 
                                    </div>
                                    <div className='font-bold text-3xl'>
                                        {user.name}
                                    </div>

                                    <div>
                                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRich Advisor</span>
                                            <span className='pl-2 pr-1'>{data.member?.team_id?.team_name}</span>
                                            {data.member?.position === '팀장' ||  data.member?.position === '파트장' ? (
                                                data.member.position
                                            ) : data.member.rank}
                                        </p>
                                        <p className='text-slate-500'>{data.introduction || ''}</p>
                                    </div>
                                    <div className='flex flex-col space-y-1 font-normal text-md'>
                                        {birthdayDates.length > 0 && (
                                            <div className='flex items-center gap-x-2'>
                                                <LuCake /> {birthdayDates.map((date, index) => (
                                                    <span key={index}>
                                                        {formatDateToKorean(date.date, 'monthDay')}
                                                        {isTodayBirthday(date.date) && ' 🎂'}
                                                    </span>
                                                ))}
                                            </div>
                                        )} 

                                        {personalContact && personalContact.phone_number && (
                                            <div className='flex items-center gap-x-2'>
                                                <LuSmartphone /> {personalContact.phone_number}
                                            </div>
                                        )}

                                        {companyContact && companyContact.phone_number && (
                                            <div className='flex items-center gap-x-2'>
                                                <LuBuilding /> {companyContact.phone_number} {companyContact.extension ? `(${companyContact.extension})` : ''}
                                            </div>
                                        )}

                                        <div className='flex items-center gap-x-2'>
                                            <AiOutlineMail /> {user.email}
                                        </div>
                                    </div>
                                    <div className='flex gap-x-3 mt-4'>
                                        <button onClick={handleOpenPasswordDrawer} className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100'>비밀번호 변경</button>
                                        <button onClick={handleOpenDrawer} className='flex justify-center items-center gap-x-2 p-3 w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100 dark:border-blue-800 dark:text-blue-800 dark:active:bg-slate-600 dark:active:text-slate-400'><TbUserEdit />프로필 수정</button>
                                    </div>
                                </>
                            )
                        }
                    </div>
                    {isLoading ? ( 
                        <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                            <div className="flex flex-col items-center justify-center">
                                    <MutatingDots
                                        visible={true}
                                        height="100"
                                        width="100"
                                        color="#b8a57f"
                                        secondaryColor="#0433FF"
                                        radius="12.5"
                                        ariaLabel="mutating-dots-loading"
                                        wrapperStyle={{}}
                                        wrapperClass=""
                                    />
                            </div>
                        </div>
                    ): (
                        <>
                            <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {data.phones.length === 0 ? (
                                        <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                            <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                                        </div>
                                    ) : (
                                        data.phones.map((contact, index) => (
                                            <li key={index} className='flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300'>
                                                <div className='flex items-center space-x-2 px-2 font-semibold'>
                                                    {renderContactIcon(contact.phone_type)}
                                                    <span className='w-10 text-nowrap'>{renderContactLabel(contact.phone_type)}</span>
                                                </div>
                                                <span>
                                                    {contact.phone_number} {contact.extension && `(${contact.extension})`}
                                                </span>
                                            </li>
                                        )))
                                    }
                                </ul>
                            </div>

                            <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {data.addresses.length === 0 ? (
                                        <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                            <p className="font-semibold text-center">주소 정보가 없습니다.</p>
                                        </div>
                                    ) : (
                                        data.addresses.map((address, index) => (
                                            <li key={index} className='flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300'>
                                                <div className='flex items-center space-x-2 px-2 font-semibold'>
                                                    {renderAddressIcon(address.address_type)}
                                                    <span className='w-10 text-nowrap'>{renderAddressLabel(address.address_type)}</span>
                                                </div>
                                                <span>
                                                    {`${address.address_line1} ${address.address_line2} `}
                                                </span>
                                            </li>
                                        )))
                                    }
                                </ul>
                            </div>

                            <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {data.dates.length === 0 ? (
                                        <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                            <p className="font-semibold text-center">생일 및 입사 정보가 없습니다.</p>
                                        </div>
                                    ) : (
                                        data.dates.map((date, index) => (
                                            <li key={index} className='flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300'>
                                                <div className='flex items-center space-x-2 px-2 font-semibold'>
                                                    {renderDateIcon(date.date_type)}
                                                    <span className='w-10 text-nowrap'>{renderDateLabel(date.date_type)}</span>
                                                </div>
                                                <span>
                                                    {formatDateToKorean(date.date)}
                                                </span>
                                            </li>
                                        )))
                                    }
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <ProfileEditDrawer
                isOpen={isOpen}
                title={"프로필 수정"}
                memberId={memberId}
                profileId={profileData.profileId}
                userData={profileData}
                onSave={handleSave}
                onClose={handleCloseDrawer}
            />

            <PasswordChangeDrawer 
                isOpen={isPasswordOpen}
                title={"패스워드 변경"}
                memberId={memberId}
                onSave={handlePasswordChange}
                onClose={handleClosePasswordChangeDrawer}
                successMsg={successMsg}
                errMsg={errMsg}
            />
        </>
    )
}

export default Profile;