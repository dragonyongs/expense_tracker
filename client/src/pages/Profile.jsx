import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthProvider';
import ProfileDrawer from '../components/ProfileDrawer';
import axios from "../services/axiosInstance"; 
import { AvatarContext } from '../context/AvatarContext';
import AvatarComponent from '../components/AvatarComponent';
import AvatarPreview from '../components/AvatarPreview';
import { useMobile } from '../context/MobileContext';
import { API_URLS } from '../services/apiUrls';
import Loading from '../components/Loading';

import { ThreeDots } from 'react-loader-spinner';
import { LuBuilding, LuSmartphone, LuTrash, LuCake, LuActivity } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { TbUserEdit } from "react-icons/tb";
import { renderContactIcon, renderContactLabel, renderDateIcon, renderDateLabel, renderAddressIcon, renderAddressLabel } from '../utils/profileRenderUtils';
import { formatDateForInput, formatDateToKorean, isTodayBirthday, calculateYearsSinceEntry } from '../utils/dateUtils';

import useProfileData from '../hooks/useProfileData';

const Profile = () => {
    const isMobile = useMobile();
    const { avatarConfig } = useContext(AvatarContext);
    const { user } = useContext(AuthContext);

    // 초기 상태 정의
    const [isOpen, setIsOpen] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    
    const [updatedContacts, setUpdatedContacts] = useState([]);
    const [updatedAddresses, setUpdatedAddresses] = useState([]);
    const [updatedDates, setUpdatedDates] = useState([]);

    const memberId = user.member_id;

    const { 
        deletedItems,
        personalContact,
        companyContact,
        data, 
        updateIntroduction,
        setLoading,
        loading, 
        error, 
        fetchProfileData, 
        handleAddItem, 
        handleUpdateItem, 
        handleRemoveItem,
        handleDaumPostCode
    } = useProfileData(memberId);

    // 필요한 데이터는 data 객체에서 직접 참조
    useEffect(() => {
        fetchProfileData();
    }, [memberId]);

    if (loading) return <div className='min-h-default-screen'><Loading type="ThreeDots" /></div>;
    if (error) return <div>{error}</div>;

    // 연락처 추가 함수
    const handleAddContact = () => handleAddItem('contacts', { phone_type: '', phone_number: '', extension: '' });

    // 주소 추가 함수
    const handleAddAddress = () => handleAddItem('addresses', { address_type: '', address_name: '', address_line1: '', address_line2: '', postal_code: '' });

    // 날짜 추가 함수
    const handleAddDate = () => handleAddItem('dates', { date_type: '', date: '' });

    // 연락처 삭제 함수
    const handleRemoveContact = (index) => handleRemoveItem('contacts', index);

    // 주소 삭제 함수
    const handleRemoveAddress = (index) => handleRemoveItem('addresses', index);

    // 날짜 삭제 함수
    const handleRemoveDate = (index) => handleRemoveItem('dates', index);

    const handleUpdateContact = (index, field, value) => {
    const updated = handleUpdateItem('contacts', index, field, value);
    setUpdatedContacts(prev => updated); // 이전 상태를 참조하여 업데이트
};

const handleUpdateAddress = (index, field, value) => {
    const updated = handleUpdateItem('addresses', index, field, value);
    setUpdatedAddresses(prev => updated);
};

const handleUpdateDates = (index, field, value) => {
    const updated = handleUpdateItem('dates', index, field, value);
    setUpdatedDates(prev => updated);
};

    const handleIntroductionChange = async (event) => {
        updateIntroduction(event.target.value);
    };
    
    const handleSave = async () => {
        let hasError = false;
        setLoading(true);
        setErrMsg('');
        try {

            data.contacts.forEach((contact, index) => {
                if (!contact.phone_type) {
                    setErrMsg(`연락처 ${index + 1}의 전화 유형을 선택해주세요.`);
                    hasError = true;
                }
            });

            if (hasError) {
                return;
            }

            const processItems = (items, currentItems, apiUrl, deletedItems, memberId) => {
                const newItems = items.filter(item => !item._id); // 새 아이템들
                const updatedItems = items.filter(item => item._id).filter(item => {
                    const currentItem = currentItems.find(ci => ci._id === item._id);
                    console.log('Current Item:', currentItem, 'New Item:', item); // 변경 확인용 로그
                    return currentItem && Object.keys(item).some(field => item[field] !== currentItem[field]); // 변경된 아이템들
                });
    
                // 각 요청에 member_id 추가
                const newItemsPromises = newItems.map(item => axios.post(apiUrl, { member_id: memberId, ...item }));
                const updateItemsPromises = updatedItems.map(item => axios.put(`${apiUrl}/${item._id}`, { ...item }));
                const deletedItemsRequests = deletedItems.map(id => axios.delete(`${apiUrl}/${id}`)); // 삭제된 아이템 요청
                return [...newItemsPromises, ...updateItemsPromises, ...deletedItemsRequests];
            };

            let avatarId = data.avatar_id;

            if (Object.keys(avatarConfig).length > 0) {
                const avatarResponse = await axios.put(`${API_URLS.AVATARS}/${memberId}`, avatarConfig);
                if (!avatarResponse || !avatarResponse.data) {
                    throw new Error('아바타 정보를 저장하는 데 실패했습니다.');
                }
                avatarId = avatarResponse.data._id; // 새로 저장된 아바타의 ID 저장
            }

            console.log('Updated Contacts:', updatedContacts);
            console.log('Updated Addresses:', updatedAddresses);
            console.log('Updated Dates:', updatedDates);

            await Promise.all([
    axios.put(`${API_URLS.PROFILES}/${data.profileId}`, { avatar_id: avatarId, introduction: data.introduction }),
    ...processItems(updatedContacts || [], data.contacts, API_URLS.PHONES, deletedItems.contacts, memberId),
    ...processItems(updatedAddresses || [], data.addresses, API_URLS.ADDRESSES, deletedItems.addresses, memberId),
    ...processItems(updatedDates || [], data.dates, API_URLS.DATES, deletedItems.dates, memberId)
]);
    
            await fetchProfileData();
        } catch (error) {
            console.error('저장 오류:', error);
            setErrMsg('프로필 저장에 실패했습니다.'); // 사용자에게 오류 메시지 표시
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };
    
    const handleOpenDrawer = () => {
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    const birthdayDates = data.dates.filter(date => date.date_type === 'birthday');

    const { years, days } = calculateYearsSinceEntry(data.dates);

    return (
        <>
            <div className={`transition-all ${isOpen && 'pt-4 bg-slate-400'}`}>
                <header className={`flex justify-between items-center py-4 pl-6 pr-3 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                    <div className='text-2xl' >
                        <span className='font-semibold'>프로필</span>
                    </div>
                </header>
                <div className='flex flex-col gap-y-3 px-4 pb-4 dark:bg-slate-800'>

                    <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                        <div className='absolute top-6 right-6 flex gap-x-1 items-center text-md text-slate-500'>
                        {days > 0 && <LuActivity /> }
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
                            <button className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>QR 연락처</button>
                            <button className='flex justify-center items-center gap-x-2 p-3 w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100 dark:border-blue-800 dark:text-blue-800 dark:active:bg-slate-600 dark:active:text-slate-400' onClick={handleOpenDrawer}><TbUserEdit />프로필 수정</button>
                        </div>
                    </div>

                    <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                            {data.contacts.length === 0 ? (
                                <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                    <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                                </div>
                            ) : (
                                data.contacts.map((contact, index) => (
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
                </div>
            </div>
            <ProfileDrawer
                isOpen={isOpen}
                title={"프로필 수정"}
                onClose={handleCloseDrawer}
                onSave={handleSave}
            >
                <div className={`overflow-y-auto ${isMobile ? 'h-profileDrawerMobile-screen' : 'h-profileDrawer-screen'} pb-6 px-6`}>
                    <div className="flex flex-col items-center mb-4">
                        <AvatarComponent className="w-24 h-24" {...avatarConfig} />
                    </div>

                    <div className='flex flex-col gap-y-10'>
                        <div className="flex flex-col space-y-4 dark:text-slate-400">
                            <div className='flex justify-between items-center'>
                                <label className='font-semibold text-xl'>
                                    자기소개
                                </label>
                            </div>
                            <input
                            type="text"
                            value={data.introduction}
                            onChange={handleIntroductionChange}
                            className='w-full py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500'
                            placeholder="자기소개를 입력하세요"
                        />
                        </div>
                    </div>

                    <div className='flex flex-col gap-y-10 mt-10'>
                        <div className="flex flex-col space-y-4 dark:text-slate-400">
                            <div className='flex justify-between items-center'>
                                <label className='font-semibold text-xl'>연락처</label>
                                <button onClick={handleAddContact} className='py-1 px-3 rounded-md border border-blue-500 text-blue-600 text-sm active:bg-slate-50'>
                                    추가
                                </button>
                            </div>
                            {data.contacts.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                                </div>
                            ) : (
                                data.contacts.map((contact, index) => (
                                    <div key={index} className="flex w-full space-x-2">
                                        <select
                                            value={contact.phone_type || ''}
                                            onChange={(e) => handleUpdateContact(index, 'phone_type', e.target.value)}
                                            className="w-1/6 py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                                        >
                                            <option>선택</option>
                                            <option value="company_phone">회사</option>
                                            <option value="work_mobile">업무</option>
                                            <option value="personal_mobile">개인</option>
                                            <option value="fax">팩스</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={contact.phone_number || ''}
                                            onChange={(e) => handleUpdateContact(index, 'phone_number', e.target.value)}
                                            className={`${contact.phone_type !== 'company_phone' ? 'w-4/6' : 'w-3/6'} flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500`}
                                            placeholder="연락처 입력"
                                            autoComplete='off'
                                            required
                                        />
                                        {/* 회사 전화일 경우에만 내선 입력 필드 표시 */}
                                        {contact.phone_type === 'company_phone' && (
                                            <input
                                                type="text"
                                                value={contact.extension || ''}
                                                onChange={(e) => handleUpdateContact(index, 'extension', e.target.value)}
                                                className={`${contact.phone_type === 'company_phone' ? 'w-1/6' : 'hidden'} py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500`}
                                                placeholder="내선(옵션)"
                                            />
                                        )}
                                        <button onClick={() => handleRemoveContact(index)} className='flex justify-center items-center w-1/6 py-1 rounded-md bg-red-500 text-white text-sm active:bg-red-700'>
                                            <LuTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className='flex flex-col gap-y-10 mt-10'>
                        <div className="flex flex-col space-y-4 dark:text-slate-400">
                            <div className='flex justify-between items-center'>
                                <label className='font-semibold text-xl'>
                                    주소
                                </label>
                                <button onClick={handleAddAddress} className='py-1 px-3 rounded-md border border-blue-500 text-blue-600 text-sm active:bg-slate-50'>
                                    추가
                                </button>
                            </div>
                            {data.addresses.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">주소 정보가 없습니다.</p>
                                </div>
                            ) : (
                                data.addresses.map((address, index) => (
                                    <div key={index} className="flex flex-col space-y-2 w-full">
                                        <div className='flex space-x-2'>
                                            <select
                                                value={address.address_type || ''}
                                                onChange={(e) => handleUpdateAddress(index, 'address_type', e.target.value)}
                                                className="w-1/6 py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                                            >
                                                <option>선택</option>
                                                <option value="home">집</option>
                                                <option value="work">회사</option>
                                                <option value="delivery">배송</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={address.address_line1 || ''}
                                                onClick={() => handleDaumPostCode(index)}
                                                onChange={(e) => handleUpdateAddress(index, 'address_line1', e.target.value)}
                                                className="w-4/6 flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                                                placeholder="주소 입력"
                                                autoComplete='off'
                                                required
                                            />
                                        </div>
                                        <div className='flex space-x-2'>
                                            <input
                                                    type="text"
                                                    value={address.address_line2 || ''}
                                                    onChange={(e) => handleUpdateAddress(index, 'address_line2', e.target.value)}
                                                    className="w-3/6 flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                                                    placeholder="세부 주소 입력"
                                                    autoComplete='off'
                                                    required
                                                />
                                            <input
                                                type="text"
                                                value={address.postal_code || ''}
                                                onChange={(e) => handleUpdateAddress(index, 'postal_code', e.target.value)}
                                                className="w-2/6 flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                                                placeholder="우편번호"
                                                autoComplete='off'
                                                required
                                                />
                                            <button onClick={() => handleRemoveAddress(index)} className='flex justify-center items-center w-1/6 py-1 rounded-md bg-red-500 text-white text-sm active:bg-red-700'>
                                                <LuTrash className="w-4 h-4" />
                                            </button>
                                        </div>

                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className='flex flex-col gap-y-10 mt-10'>
                        <div className="flex flex-col space-y-4 dark:text-slate-400">
                            <div className='flex justify-between items-center'>
                                <label className='font-semibold text-xl'>
                                    일자
                                </label>
                                <button onClick={handleAddDate} className='py-1 px-3 rounded-md border border-blue-500 text-blue-600 text-sm active:bg-slate-50'>
                                    추가
                                </button>
                            </div>
                            {data.dates.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">일자 정보가 없습니다.</p>
                                </div>
                            ) : (
                                data.dates.map((date, index) => (
                                    <div key={index} className="flex w-full space-x-2">
                                        <select
                                            value={date.date_type || ''}
                                            onChange={(e) => handleUpdateDates(index, 'date_type', e.target.value)}
                                            className="w-1/6 py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                                        >
                                            <option>선택</option>
                                            <option value="entry">입사</option>
                                            <option value="leave">퇴사</option>
                                            <option value="hiatus">휴직</option>
                                            <option value="birthday">생일</option>
                                        </select>
                                        <input
                                            type="date"
                                            value={formatDateForInput(data.dates[index].date) || ''}
                                            onChange={(e) => handleUpdateDates(index, 'date', e.target.value)}
                                            className="w-4/6 flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                                            placeholder="일자 선택"
                                            autoComplete='off'
                                            required
                                        />
                                        
                                        <button onClick={() => handleRemoveDate(index)} className='flex justify-center items-center w-1/6 py-1 rounded-md bg-red-500 text-white text-sm active:bg-red-700'>
                                            <LuTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex flex-col gap-3 pt-4 p-6">
                    <div className='flex justify-between gap-y-4 gap-x-2'>
                        <button type="button" onClick={handleSave} className={`overflow-hidden min-h-10 flex justify-center items-center flex-1 w-full text-white ${loading ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700`}>
                            {loading ? <ThreeDots color='#ffffff' width={'40px'} height={'auto'} /> : "저장"}
                        </button>
                    </div>
                    <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600 dark:text-orange-300">
                        취소
                    </button>
                </div>
            </ProfileDrawer>
        </>
    )
}

export default Profile;