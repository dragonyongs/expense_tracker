import React, { useState, useEffect, useContext, useMemo } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { ThreeDots } from 'react-loader-spinner';
import { LuBuilding, LuSmartphone, LuHome, LuCalendarDays, LuTrash, LuCake } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { CiDeliveryTruck } from "react-icons/ci";

import { LiaFaxSolid } from "react-icons/lia";
import { TbUserEdit } from "react-icons/tb";
import { RiSignpostLine } from "react-icons/ri";
import ProfileDrawer from '../components/ProfileDrawer';
import axios from "../services/axiosInstance"; 
import { AvatarContext } from '../context/AvatarContext';
import AvatarComponent from '../components/AvatarComponent';
import AvatarPreview from '../components/AvatarPreview';
import { useMobile } from '../context/MobileContext';
import { API_URLS } from '../services/apiUrls';

const renderContactIcon = (type) => {
    switch (type) {
        case 'company_phone':
            return <LuBuilding />;
        case 'work_mobile':
            return <LuSmartphone />;
        case 'personal_mobile':
            return <LuSmartphone />;
        case 'fax':
            return <LiaFaxSolid />;
        default:
            return null;
    }
};

const renderContactLabel = (type) => {
    switch (type) {
        case 'company_phone':
            return '회사';
        case 'work_mobile':
            return '업무';
        case 'personal_mobile':
            return '개인';
        case 'fax':
            return '팩스';
        default:
            return '알수없음';
    }
};

const renderDateIcon = (type) => {
    switch (type) {
        case 'birthday':
            return <LuCake />;
        default:
            return <LuCalendarDays />;
    }
};

const renderDateLabel = (type) => {
    switch (type) {
        case 'entry':
            return '입사';
        case 'leave':
            return '퇴사';
        case 'hiatus':
            return '휴직';
        case 'birthday':
            return '생일';
        default:
            return '알수없음';
    }
};

const renderAddressIcon = (type) => {
    switch (type) {
        case 'home':
            return <LuHome />;
        case 'work':
            return <LuBuilding />;
        case 'delivery':
            return <CiDeliveryTruck />;
        default:
            return null;
    }
};

const renderAddressLabel = (type) => {
    switch (type) {
        case 'home':
            return '집';
        case 'work':
            return '회사';
        case 'delivery':
            return '배송';
        default:
            return '알수없음';
    }
};

const formatDateForInput = (dateString) => {
    if (!dateString) return ''; // 빈 값 처리
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // yyyy-MM-dd 형식으로 반환
};

const formatDateToKorean = (dateString) => {
    if (!dateString) return ''; // 빈 값 처리
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`; // 한국어 형식으로 반환
};

const calculateYearsSinceEntry = (dates) => {
    const entryDates = dates.filter(date => date.date_type === 'entry');

    // 입사 날짜가 없을 경우 0을 반환
    if (entryDates.length === 0) {
        return { years: 0, days: 0 }; // 객체로 반환
    }

    const latestEntryDate = entryDates.reduce((latest, date) => {
        const currentDate = new Date(date.date);
        return currentDate > latest ? currentDate : latest;
    }, new Date(0));

    const now = new Date();
    const yearsDifference = now.getFullYear() - latestEntryDate.getFullYear();

    // 만약 현재 날짜가 가장 최근의 입사일이 지나지 않았다면 -1을 반환
    const isPastAnniversary = now.getMonth() > latestEntryDate.getMonth() || 
        (now.getMonth() === latestEntryDate.getMonth() && now.getDate() >= latestEntryDate.getDate());

    // 일 수 계산
    const daysDifference = Math.floor((now - latestEntryDate) / (1000 * 60 * 60 * 24));

    return {
        years: yearsDifference + (isPastAnniversary ? 1 : 0),
        days: daysDifference
    };
};

const Profile = () => {
    const isMobile = useMobile();
    const { avatarConfig } = useContext(AvatarContext);
    const { user } = useContext(AuthContext);
    
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [member, setMember] = useState({});

    const [contacts, setContacts] = useState([]);
    const [deletedContacts, setDeletedContacts] = useState([]);

    const [dates, setDates] = useState([]);
    const [deletedDates, setDeletedDates] = useState([]);

    const [addresses, setAddresses] = useState([]);
    const [deletedAddresses, setDeletedAddresses] = useState([]);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    const loadDaumPostcodeScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.async = true;
            script.onload = resolve;
            document.body.appendChild(script);
        });
    };

    // 데이터를 한 번에 가져오는 함수
    const fetchProfileData = async () => {
        try {
            const [contactsRes, addressesRes, datesRes, memberRes] = await Promise.all([
                axios.get(`${API_URLS.PHONES}/${user.member_id}`),
                axios.get(`${API_URLS.ADDRESSES}/${user.member_id}`),
                axios.get(`${API_URLS.DATES}/${user.member_id}`),
                axios.get(`${API_URLS.MEMBERS}/${user.member_id}`)
            ]);
            setContacts(contactsRes.data || []);
            setAddresses(addressesRes.data || []);
            setDates(datesRes.data || []);
            setMember(memberRes.data || {});
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchProfileData();

        loadDaumPostcodeScript().then(() => {
            setIsScriptLoaded(true);  // 스크립트가 성공적으로 로드되면 상태를 업데이트
        });
    }, []);

    useEffect(() => {
        if (isOpen && contacts.length === 0 && addresses.length === 0 && dates.length === 0) {
            fetchProfileData();
        }
    }, [isOpen, contacts.length, addresses.length, dates.length]);

    // 공통적으로 추가 및 업데이트 처리를 위한 함수
    const handleAddItem = (setFunction, newItem) => {
        setFunction((prevItems) => [...prevItems, newItem]);
    };

    const handleUpdateItem = (setFunction, items, index, field, value) => {
        const updatedItems = items.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        setFunction(updatedItems);
    };

    const handleRemoveItem = (setFunction, items, setDeleted, index) => {
        const removedItem = items[index];
        const updatedItems = items.filter((_, i) => i !== index);
        setFunction(updatedItems);
        setDeleted((prev) => [...prev, removedItem._id]);
    };

    const handleAddContact = () => handleAddItem(setContacts, { phone_type: '', phone_number: '', extension: '' });
    const handleAddAddress = () => handleAddItem(setAddresses, { address_type: '', address_name: '', address_line1: '', address_line2: '', postal_code: '' });
    const handleAddDate = () => handleAddItem(setDates, { date_type: '', date: '' });

    const handleRemoveContact = (index) => handleRemoveItem(setContacts, contacts, setDeletedContacts, index);
    const handleRemoveAddress = (index) => handleRemoveItem(setAddresses, addresses, setDeletedAddresses, index);
    const handleRemoveDate = (index) => handleRemoveItem(setDates, dates, setDeletedDates, index);

    const handleDaumPostCode = (index) => {
        if (!isScriptLoaded) return;
    
        new window.daum.Postcode({
            oncomplete: (data) => {
                const fullAddress = data.address;
                const postalCode = data.zonecode;
    
                setAddresses((prevAddresses) => 
                    prevAddresses.map((address, i) => 
                        i === index
                        ? { ...address, address_line1: fullAddress, postal_code: postalCode }
                        : address
                    )
                );
            }
        }).open();
    };
    
    // 연락처 및 일자 저장 로직
    const handleSave = async () => {
        setLoading(true);
        try {
            // 데이터 가져오기
            const [contactsResponse, addressesResponse, datesResponse] = await Promise.all([
                axios.get(`${API_URLS.PHONES}/${user.member_id}`),
                axios.get(`${API_URLS.ADDRESSES}/${user.member_id}`),
                axios.get(`${API_URLS.DATES}/${user.member_id}`)
            ]);
    
            const currentContacts = Array.isArray(contactsResponse.data) ? contactsResponse.data : [];
            const currentAddresses = Array.isArray(addressesResponse.data) ? addressesResponse.data : [];
            const currentDates = Array.isArray(datesResponse.data) ? datesResponse.data : [];
    
            // 연락처 및 일자에 대해 새로운 항목과 업데이트, 삭제 항목 처리
            const processItems = (items, currentItems, apiUrl, deletedItems, memberId) => {
                const newItems = items.filter(item => !item._id);
                const updatedItems = items.filter(item => item._id).filter(item => {
                    const currentItem = currentItems.find(ci => ci._id === item._id);
                    return currentItem && Object.keys(item).some(field => item[field] !== currentItem[field]);
                });
                const deletedItemsRequests = deletedItems.map(id => axios.delete(`${apiUrl}/${id}`));
    
                const newItemsPromises = newItems.map(item => axios.post(apiUrl, { member_id: memberId, ...item }));
                const updateItemsPromises = updatedItems.map(item => axios.put(`${apiUrl}/${item._id}`, { ...item }));
    
                return [...newItemsPromises, ...updateItemsPromises, ...deletedItemsRequests];
            };
    
            // 연락처와 일자 처리
            const contactPromises = processItems(contacts, currentContacts, API_URLS.PHONES, deletedContacts, user.member_id);
            const addressPromises = processItems(addresses, currentAddresses, API_URLS.ADDRESSES, deletedAddresses, user.member_id);
            const datePromises = processItems(dates, currentDates, API_URLS.DATES, deletedDates, user.member_id);
    
            // 아바타 정보 저장
            const avatarResponse = await axios.put(`${API_URLS.AVATARS}/${user.member_id}`, avatarConfig);
            const avatarId = avatarResponse.data._id;
    
            // 프로필 업데이트 또는 생성
            const profileResponse = await axios.get(`${API_URLS.PROFILES}/${user.member_id}`);
            const profileData = {
                avatar_id: avatarId,
                phones: contacts.map(c => c._id),
                dates: dates.map(d => d._id),
                addresses: addresses.map(d => d._id),
            };
    
            if (profileResponse.data) {
                await axios.put(`${API_URLS.PROFILES}/${profileResponse.data._id}`, profileData);
            } else {
                await axios.post(`${API_URLS.PROFILES}`, { member_id: user.member_id, ...profileData });
            }
    
            // 병렬로 모든 요청 처리
            await Promise.all([
                ...contactPromises,
                ...addressPromises,
                ...datePromises
            ]);
    
            // 데이터 재호출
            await fetchProfileData();
    
        } catch (error) {
            console.error('데이터 저장 오류:', error);
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

    // 개인 번호를 필터링하여 추출
    const personalContact = useMemo(() => 
        contacts.find(contact => contact.phone_type === 'personal_mobile'), 
        [contacts]
    );
    
    const personalPhoneNumber = personalContact ? personalContact.phone_number : '번호 없음';
    
    // 컴포넌트 내에서 사용 예시
    const { years, days } = calculateYearsSinceEntry(dates);

    return (
        <>
            <header className={`flex justify-between items-center py-4 pl-6 pr-3 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>프로필</span>
                </div>
                <button className='flex justify-center p-3 dark:text-slate-300 rounded-md active:bg-gray-100 active:text-gray-400 dark:active:bg-slate-600 dark:active:text-slate-400' onClick={handleOpenDrawer}><TbUserEdit className='w-6 h-6'/></button>
            </header>
            <div className='flex flex-col gap-y-3 px-4 pb-4 dark:bg-slate-800'>

                <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                    <div className='absolute top-6 right-6 text-md text-slate-500'>
                        {years >= 2 
                            ? `입사 ${years}년차` 
                            : (days > 0 && `입사 ${days}일차`)}
                    </div>
                    <div className='flex justify-center items-center w-24 h-24 bg-slate-100 rounded-xl overflow-hidden'>
                        <AvatarPreview avatarConfig={avatarConfig} shape="rounded" /> 
                        {/* <Avatar className="w-full h-full rounded-none" style={{borderRadius: 'none'}} {...avatarConfig} /> */}
                    </div>
                    <div className='font-bold text-3xl'>
                        {user.name}
                    </div>

                    <div>
                        <p className='text-slate-800'>
                            {dates.filter(date => date.date_type === 'birthday').map(date => (
                                <span key={date._id}>{formatDateToKorean(date.date)} 🎂</span>
                            ))}
                        </p>
                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRich Advisor</span>
                            <span className='pl-2 pr-1'>{member?.team_id?.team_name}</span>
                            {member?.position === '팀장' ||  member?.position === '파트장' ? (
                                member.position
                            ) : member.rank}
                        </p>
                        <p className='text-slate-500'>What is good today, may be a cliche tomorrow.</p>
                    </div>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <LuSmartphone /> <p className='font-normal text-lg'>{personalPhoneNumber}</p>
                        </div>
                        <div className='flex items-center gap-x-2'>
                            <AiOutlineMail /> <p className='font-normal text-lg'>{user.email}</p>
                        </div>
                    </div>
                    <div className='flex gap-x-3 mt-4'>
                        <button className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>이미지 저장</button>
                        <button className='w-full py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>QR 연락처</button>
                    </div>
                </div>

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                        {contacts.length === 0 ? (
                            <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                            </div>
                        ) : (
                            contacts.map((contact, index) => (
                                <li key={index} className='flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300'>
                                    <div className='flex items-center space-x-2 px-2 font-semibold'>
                                        {/* 연락처 타입에 맞는 아이콘과 라벨을 표시 */}
                                        {renderContactIcon(contact.phone_type)}
                                        <span className='w-10 text-nowrap'>{renderContactLabel(contact.phone_type)}</span>
                                    </div>
                                    {/* 내선 번호가 있는 경우 함께 출력 */}
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
                        {addresses.length === 0 ? (
                            <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                <p className="font-semibold text-center">주소 정보가 없습니다.</p>
                            </div>
                        ) : (
                            addresses.map((address, index) => (
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
                {/* <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuBuilding /><span className='w-7 text-nowrap'>회사</span>
                            </div>
                            <span className=''>서울시 강남구 강남대로62길 23, 역삼빌딩 3층</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuHome /><span className='w-7 text-nowrap'>집</span>
                            </div>
                            <span className=''>서울시 동대문구 약령시로00길 00, 0동 000호(청량리동)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <RiSignpostLine /><span className='w-7 text-nowrap'>택배</span>
                            </div>
                            <span className=''>서울시 강남구 강남대로62길 3, 한진빌딩 5층</span>
                        </li>
                    </ul>
                </div> */}

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700'>
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-600">
                        {dates.length === 0 ? (
                            <div className="p-4 bg-slate-100 rounded-md dark:bg-slate-700 dark:text-slate-300">
                                <p className="font-semibold text-center">생일 및 입사 정보가 없습니다.</p>
                            </div>
                        ) : (
                            dates.map((date, index) => (
                                <li key={index} className='flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300'>
                                    <div className='flex items-center space-x-2 px-2 font-semibold'>
                                        {/* 연락처 타입에 맞는 아이콘과 라벨을 표시 */}
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

            <ProfileDrawer
                isOpen={isOpen}
                title={"프로필 수정"}
                onClose={handleCloseDrawer}
                onSave={handleSave}
            >
                <div className={`overflow-y-auto ${isMobile ? 'h-profileDrawerMobile-screen' : 'h-profileDrawer-screen'} pb-6 px-6`}>
                    <div className="flex flex-col items-center mb-4">
                        <AvatarComponent className="w-24 h-24" {...avatarConfig} />;
                    </div>

                    <div className='flex flex-col gap-y-10'>
                        <div className="flex flex-col space-y-4 dark:text-slate-400">
                            <div className='flex justify-between items-center'>
                                <label className='font-semibold text-xl'>
                                    연락처
                                </label>
                                <button onClick={handleAddContact} className='py-1 px-3 rounded-md border border-blue-500 text-blue-600 text-sm active:bg-slate-50'>
                                    추가
                                </button>
                            </div>
                            {contacts.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">연락처 정보가 없습니다.</p>
                                </div>
                            ) : (
                                contacts.map((contact, index) => (
                                    <div key={index} className="flex w-full space-x-2">
                                        <select
                                            value={contact.phone_type || ''}
                                            onChange={(e) => handleUpdateItem(setContacts, contacts, index, 'phone_type', e.target.value)}
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
                                            onChange={(e) => handleUpdateItem(setContacts, contacts, index, 'phone_number', e.target.value)}
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
                                                onChange={(e) => handleUpdateItem(index, 'extension', e.target.value)}
                                                className={`${contact.phone_type === 'company_phone' ? 'w-1/6' : 'hidden'} py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500 }`}
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
                            {addresses.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">주소 정보가 없습니다.</p>
                                </div>
                            ) : (
                                addresses.map((address, index) => (
                                    <div key={index} className="flex flex-col space-y-2 w-full">
                                        <div className='flex space-x-2'>
                                            <select
                                                value={address.address_type || ''}
                                                onChange={(e) => handleUpdateItem(setAddresses, addresses, index, 'address_type', e.target.value)}
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
                                                onChange={(e) => handleUpdateItem(setAddresses, addresses, index, 'address_line1', e.target.value)}
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
                                                    onChange={(e) => handleUpdateItem(setAddresses, addresses, index, 'address_line2', e.target.value)}
                                                    className="w-3/6 flex-1 py-2 px-3 bg-slate-100 rounded-md border border-slate-200 placeholder:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500"
                                                    placeholder="세부 주소 입력"
                                                    autoComplete='off'
                                                    required
                                                />
                                            <input
                                                type="text"
                                                value={address.postal_code || ''}
                                                onChange={(e) => handleUpdateItem(setAddresses, addresses, index, 'postal_code', e.target.value)}
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
                            {dates.length === 0 ? (
                                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                                    <p className="font-semibold text-center">일자 정보가 없습니다.</p>
                                </div>
                            ) : (
                                dates.map((date, index) => (
                                    <div key={index} className="flex w-full space-x-2">
                                        <select
                                            value={date.date_type || ''}
                                            onChange={(e) => handleUpdateItem(setDates, dates, index, 'date_type', e.target.value)}
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
                                            value={formatDateForInput(dates[index].date) || ''}
                                            onChange={(e) => handleUpdateItem(setDates, dates, index, 'date', e.target.value)}
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