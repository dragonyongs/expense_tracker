import React, { useState, useEffect, useContext, useMemo } from 'react'
import { AuthContext } from '../context/AuthProvider';
import { ThreeDots } from 'react-loader-spinner';
import { LuBuilding, LuSmartphone, LuHome, LuCalendarDays, LuTrash } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
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

const Profile = () => {
    const isMobile = useMobile();

    const { avatarConfig } = useContext(AvatarContext);

    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [contacts, setContacts] = useState([]);  // 연락처 배열
    const [deletedContacts, setDeletedContacts] = useState([]); // 삭제된 연락처 ID를 추적

    const fetchProfileData = async () => {
        try {
            const contactsRes = await  axios.get(`${API_URLS.PHONES}/${user.member_id}`);
    
            setContacts(contactsRes.data || []);

        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
        }
    };
    
    useEffect(() => {
        fetchProfileData();
    }, []);

    useEffect(() => {
        if (isOpen && contacts.length === 0) {  // 데이터가 없을 때만 호출
            fetchProfileData();
        }
    }, [isOpen, contacts.length]);
    
    const handleAddContact = () => {
        const newContact = {
            phone_type: '',
            phone_number: '',
            extension: '',
        };
        setContacts((prevContacts) => [...prevContacts, newContact]);
    };
    
    const handleUpdateContact = (index, field, value) => {
        const updatedContacts = contacts.map((contact, i) => 
            i === index ? { ...contact, [field]: value } : contact
        );
        setContacts(updatedContacts);
    };
    
    const handleRemoveContact = (index) => {
        const removedContact = contacts[index]; // 삭제된 연락처 정보 가져오기
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        setDeletedContacts((prev) => [...prev, removedContact._id]); // 삭제된 연락처 ID 추가
    };
    
    const handleSave = async () => {
        setLoading(true);
        try {
            // 현재 연락처 가져오기
            const { data: currentContacts } = await axios.get(`${API_URLS.PHONES}/${user.member_id}`);
            
            // 새로운 연락처 추가
            const newContactsPromises = contacts
            .filter(c => !c._id) // 새로 추가된 연락처만 필터링
            .map(contact => axios.post(`${API_URLS.PHONES}`, { member_id: user.member_id, ...contact }));

            // 기존 연락처 업데이트 - 변경 사항이 있는 경우만
            const updateContactsPromises = contacts
                .filter(c => c._id) // 기존 연락처만 필터링
                .filter(c => { // 기존 값과 변경된 값 비교
                    const currentContact = currentContacts.find(cc => cc._id === c._id);
                    return currentContact && (
                        currentContact.phone_number !== c.phone_number ||
                        currentContact.phone_type !== c.phone_type ||
                        currentContact.extension !== c.extension
                    );
                })
                .map(contact => axios.put(`${API_URLS.PHONES}/${contact._id}`, { ...contact }));
            
            // 삭제된 연락처 요청
            const deleteContactsPromises = deletedContacts.map(contactId =>
                axios.delete(`${API_URLS.PHONES}/${contactId}`)
            );
    
            // 아바타 정보 저장 요청
            const avatarSavePromise = axios.put(`${API_URLS.AVATARS}/${user.member_id}`, avatarConfig);
            const avatarResponse = await avatarSavePromise; // 아바타 저장 요청 기다리기
            const avatarId = avatarResponse.data._id; // 새로 생성된 아바타 ID
    
            // 프로필 존재 여부 확인
            let profileResponse;
            try {
                profileResponse = await axios.get(`${API_URLS.PROFILES}/${user.member_id}`);
            } catch (error) {
                profileResponse = null; // 프로필이 없으면 null
            }
    
            let profilePromise;

            if (profileResponse && profileResponse.data) {
                // 프로필이 존재하면 업데이트
                if (!avatarId || profileResponse.data.avatar_id !== avatarId) { // 중복 방지 조건 추가
                    const profileData = {
                        avatar_id: avatarId,
                        phones: contacts.map(c => c._id),
                        dates: [],
                        addresses: []
                    };
                    const profileId = profileResponse.data._id;
                    profilePromise = axios.put(`${API_URLS.PROFILES}/${profileId}`, profileData);
                }
            } else {
                // 프로필이 없을 때만 생성
                const profileData = {
                    member_id: user.member_id,
                    avatar_id: avatarId,
                    phones: contacts.map(c => c._id),
                    dates: [],
                    addresses: []
                };
                profilePromise = axios.post(`${API_URLS.PROFILES}`, profileData);
            }
    
            // 병렬로 모든 요청 처리
            await Promise.all([
                ...newContactsPromises,
                ...updateContactsPromises,
                ...deleteContactsPromises,
                profilePromise // 프로필 저장 요청 추가
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
                        입사 N년차
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
                            1900.00.00(양) 🎂
                        </p>
                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRich Advisor</span> 퍼블리싱팀 팀장</p>
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
                                <p className="font-semibold text-center">등록된 연락처가 없습니다.</p>
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

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
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
                </div>

                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>생일</span>
                            </div>
                            <span className=''>1900년 0월 0일 (양)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>입사</span>
                            </div>
                            <span className=''>2017년 2월 1일</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>퇴사</span>
                            </div>
                            <span className=''>2022년 3월 30일</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>입사</span>
                            </div>
                            <span className=''>2022년 10월 2일</span>
                        </li>
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