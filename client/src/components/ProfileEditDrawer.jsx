import React, { useState, useEffect, useContext, memo } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import axios from "../services/axiosInstance"; 
import { AvatarContext } from '../context/AvatarContext';
import AvatarComponent from '../components/AvatarComponent';
import useMediaQuery from '../hooks/useMediaQuery';
import useViewportHeight from '../hooks/useViewportHeight';
import useProfileData from '../hooks/useProfileData';
import { API_URLS } from '../services/apiUrls';
import { ThreeDots } from 'react-loader-spinner';
import { FaChevronDown } from "react-icons/fa";
import { LuTrash } from "react-icons/lu";
import { formatDateForInput } from '../utils/dateUtils';
import useDrawerTheme from '../hooks/useDrawerTheme';

const ProfileEditDrawer = memo((({ userData, memberId, profileId, title, onClose, onSave, isOpen }) => {
    useDrawerTheme(isOpen);

    const [profile, setProfile] = useState({
        phones: [],
        addresses: [],
        dates: [],
        avatarId: {},
        introduction: '',
        profileId: '',
    });
    
    const { avatarConfig, setAdminMode, resetAdminMode } = useContext(AvatarContext);
    const { 
        deletedItems,
        handleAddItem, 
        handleUpdateItem, 
        handleRemoveItem, 
        handleDaumPostCode,
        setDeletedItems,
        error 
    } = useProfileData(memberId, setProfile);

    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const targetMemberId = memberId;

    useEffect(() => {
        if (isOpen && memberId) {
            setAdminMode(memberId); // 관리자인 경우 선택한 사용자 ID 설정
        }
        if (!isOpen) {
            resetAdminMode(); // 닫힐 때 관리자 모드 초기화
        }
    }, [isOpen, memberId, setAdminMode, resetAdminMode]);

    useEffect(() => {
        if (isOpen && userData) {
            setProfile({
                phones: userData.phones || [],
                addresses: userData.addresses || [],
                dates: userData.dates || [],
                avatarId: userData.avatarId || {},
                introduction: userData.introduction || '',
                profileId: profileId,
            });
            setIsLoading(false);
        }
    }, [isOpen, userData]);

    const isMobile = useMediaQuery('(max-width: 1024px)');
    const viewportHeight = useViewportHeight();
    const drawerSize = isMobile ? '100%' : '576px';
    const mobileStyle = {
        width: '100%',
        height: `${viewportHeight - 50}px`,
    };

    const desktopStyle = {
        left: '50%',
        marginLeft: "-50px",
        width: drawerSize,
        height: 'calc( 100vh - 145px)',
    };
    

    // 데이터가 없으면 로딩 상태를 표시
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // 서버 오류 처리
    if (error) {
        return <div>{error}</div>;
    }

    const handleAddContact = () => handleAddItem('phones', { phone_type: null, phone_name: '', phone_number: '', extension: null });
    const handleAddAddress = () => handleAddItem('addresses', { address_type: null, address_line1: '', address_line2: '', postal_code: '', address_name: '' });
    const handleAddDate = () => handleAddItem('dates', { date_type: null, date_name: '', date: ''});

    const handleRemoveContact = (index) => handleRemoveItem('phones', index, setDeletedItems);
    const handleRemoveAddress = (index) => handleRemoveItem('addresses', index, setDeletedItems);
    const handleRemoveDate = (index) => handleRemoveItem('dates', index, setDeletedItems);

    const handleUpdateContact = (index, field, value) => handleUpdateItem('phones', index, field, value);
    const handleUpdateAddress = (index, field, value) => handleUpdateItem('addresses', index, field, value);
    const handleUpdateDates = (index, field, value) => handleUpdateItem('dates', index, field, value);

    const handleAvatarChange = (updatedAvatar) => {
        setProfile((prev) => ({
            ...prev,
            avatar: updatedAvatar,
        }));
    };
    

    const processItems = (items, currentItems, apiUrl, deletedItems, memberId, itemType) => {
        // 1. 신규 아이템 필터링
        const newItems = items.filter(item => !item._id);
        
        // 2. 업데이트된 아이템 필터링
        const updatedItems = items.filter(item => {
            const existingItem = currentItems.find(ci => ci._id === item._id);
            if (!existingItem) return false; // 기존 항목이 없으면 업데이트 필요 없음
        
            if (itemType === 'phones') {
                return (
                    existingItem.phone_type !== item.phone_type ||
                    existingItem.phone_number !== item.phone_number ||
                    existingItem.extension !== item.extension
                );
            } else if (itemType === 'addresses') {
                return (
                    existingItem.address_line1 !== item.address_line1 ||
                    existingItem.address_line2 !== item.address_line2 ||
                    existingItem.postal_code !== item.postal_code ||
                    existingItem.address_type !== item.address_type
                );
            } else if (itemType === 'dates') {
                return (
                    existingItem.date !== item.date ||
                    existingItem.date_type !== item.date_type
                );
            }
            return false; // 예상치 못한 itemType 처리
        });

        // 3. 신규 아이템 요청 - 주소 타입이 없는 경우 기본 값 지정 또는 미정? 표시 기타..?
        const newItemsPromises = newItems.map(item => {
            const requestData = { member_id: memberId, ...item };
            console.log('requestData', requestData);

            return axios.post(apiUrl, requestData)
                .then(response => {
                    console.log('Added item response:', response.data);
                    return response;
                })
                .catch(error => {
                    console.error('Failed to add new item:', error.response?.data || error.message);
                    throw error;
                });
        });
        
        // 4. 업데이트된 아이템 요청
        const updateItemsPromises = updatedItems.map(item => {
            const url = `${apiUrl}/${item._id}`;
            const data = { member_id: memberId, ...item };
    
            return axios.put(url, data)
                .then(response => {
                    console.log('Update successful:', response.data);
                    return response;
                })
                .catch(error => {
                    console.error('Update failed:', {
                        url,
                        data,
                        error: error.response?.data || error.message
                    });
                    throw error;
                });
        });
    
        const deletedItemsRequests = deletedItems.map(id => {
            return axios.delete(`${apiUrl}/${id}`)
                .then(response => {
                    console.log(`Deleted item with ID: ${id}`);
                    return response;
                })
                .catch(error => {
                    console.error('Delete failed:', {
                        error: error.response?.data || error.message
                    });
                    throw error;
                });
        });

        // 6. 모든 요청 반환
        return [
            ...newItemsPromises,
            ...updateItemsPromises,
            ...deletedItemsRequests
        ];
    };
    
    const handleSave = async () => {
        try {
            setIsLoading(true);
            setErrMsg('');
    
            // 전화 유형 검증
            const hasError = profile.phones.some((contact, index) => {
                if (!contact.phone_type) {
                    setErrMsg(`연락처 ${index + 1}의 전화 유형을 선택해주세요.`);
                    return true;
                }
                return false;
            });
    
            if (hasError) return;
    
            let avatarId = profile.avatarId?._id; 
            if (Object.keys(avatarConfig).length > 0) {
                const avatarResponse = await axios.put(`${API_URLS.AVATARS}/${targetMemberId}`, avatarConfig);
                if (!avatarResponse || !avatarResponse.data) {
                    throw new Error('아바타 정보를 저장하는 데 실패했습니다.');
                }
                avatarId = avatarResponse.data._id;
            }
    
            await Promise.all([
                axios.put(`${API_URLS.PROFILES}/${profile.profileId}`, { 
                    avatar_id: avatarId, 
                    profile_id: profile.profileId, 
                    introduction: profile.introduction,
                }),
                ...processItems(profile.phones, userData.phones || [], API_URLS.PHONES, deletedItems.phones, targetMemberId, 'phones'),
                ...processItems(profile.addresses, userData.addresses || [], API_URLS.ADDRESSES, deletedItems.addresses, targetMemberId, 'addresses'),
                ...processItems(profile.dates, userData.dates || [], API_URLS.DATES, deletedItems.dates, targetMemberId, 'dates'),
            ]);

            setProfile(profile); // 여기서 profile이 올바르게 업데이트되었는지 확인
            await onSave();
        } catch (error) {
            console.error('저장 오류:', error);
            setErrMsg('프로필 저장에 실패했습니다.'); // 사용자에게 오류 메시지 표시
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' className="rounded-tr-lg rounded-tl-lg" style={isMobile ? mobileStyle : desktopStyle}>
                <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                    <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                    <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                        <FaChevronDown />
                    </button>
                </div>
                <div className='dark:bg-slate-800'>
                    <div className={`overflow-y-auto ${isMobile ? 'h-profileDrawerMobile-screen' : 'h-profileDrawer-screen'} pb-6 px-6`}>
                        <div className="flex flex-col items-center mb-4">
                            <AvatarComponent
                                avatarConfig={profile.avatar} // 초기값 전달
                                onAvatarChange={handleAvatarChange} // 변경 핸들러 전달
                            />
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
                                value={profile.introduction}
                                onChange={(e) => setProfile(prev => ({ ...prev, introduction: e.target.value }))}
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
                                {profile.phones.length === 0 ? (
                                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                                    </div>
                                ) : (
                                    profile.phones.map((contact, index) => (
                                        <div key={index} className="flex w-full space-x-2">
                                            <select
                                                value={contact.phone_type || ''}
                                                onChange={(e) => handleUpdateContact(index, 'phone_type', e.target.value)}
                                                className="w-1/5 sm:w-1/6 py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
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
                                {profile.addresses.length === 0 ? (
                                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <p className="font-semibold text-center">주소 정보가 없습니다.</p>
                                    </div>
                                ) : (
                                    profile.addresses.map((address, index) => (
                                        <div key={index} className="flex flex-col space-y-2 w-full">
                                            <div className='flex space-x-2'>
                                                <select
                                                    value={address.address_type || ''}
                                                    onChange={(e) => handleUpdateAddress(index, 'address_type', e.target.value)}
                                                    className="w-1/5 sm:w-1/6 py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
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
                                {profile.dates.length === 0 ? (
                                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                        <p className="font-semibold text-center">일자 정보가 없습니다.</p>
                                    </div>
                                ) : (
                                    profile.dates.map((date, index) => (
                                        <div key={index} className="flex w-full space-x-2">
                                            <select
                                                value={date.date_type || ''}
                                                onChange={(e) => handleUpdateDates(index, 'date_type', e.target.value)}
                                                className="w-1/5 sm:w-1/6  py-3 px-1 bg-slate-100 rounded-md border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                                            >
                                                <option>선택</option>
                                                <option value="entry">입사</option>
                                                <option value="leave">퇴사</option>
                                                <option value="loa">휴직</option>
                                                <option value="birthday">생일</option>
                                            </select>
                                            <input
                                                type="date"
                                                value={formatDateForInput(profile.dates[index].date) || ''}
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
                            <button type="button" onClick={handleSave} className={`overflow-hidden min-h-10 flex justify-center items-center flex-1 w-full text-white ${isLoading ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700`}>
                                {isLoading ? <ThreeDots color='#ffffff' width={'40px'} height={'auto'} /> : "저장"}
                            </button>
                        </div>
                        <button type="button" onClick={onClose} className="w-full text-slate-600 dark:text-orange-300">
                            취소
                        </button>
                    </div>
                </div>
        </Drawer>
    )
}));

ProfileEditDrawer.displayName = 'ProfileEditDrawer';

export default ProfileEditDrawer;