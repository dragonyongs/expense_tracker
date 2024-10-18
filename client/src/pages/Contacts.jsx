import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import { MdKeyboardArrowRight } from "react-icons/md";
import CommonDrawer from '../components/CommonDrawer';
import AvatarPreview from '../components/AvatarPreview';

function Contacts() {
    const [contacts, setContacts ] = useState([]);
    const [selectedContact, setSelectedContact] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchData(API_URLS.PROFILES, setContacts);
    }, []);

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    const handleOpenDrawer = (member) => {
        setSelectedContact(member);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    const getCompanyPhoneInfo = (phones) => {
        const companyPhone = phones.find(phone => phone.phone_type === 'company_phone');
        return {
            phone: companyPhone ? companyPhone.phone_number : '',
            extension: companyPhone ? companyPhone.extension : ''
        };
    };

    const phoneTypeMapping = {
        company_phone: '회사',
        personal_mobile: '개인',
        fax: '팩스',
    };

    return (
        <>
            <header className={`flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800`}>
                <div className='text-2xl'>
                    <span className='font-semibold'>연락망</span>
                </div>
            </header>
            <div className='p-6'>
            <ul className='flex flex-col gap-y-1'>
                    {contacts.map((contact) => {
                        const { phone, extension } = getCompanyPhoneInfo(contact.phones);
                        return (
                            <li key={contact._id} className='flex items-center gap-x-4 bg-white dark:bg-slate-700 border border-slate-100 cursor-pointer dark:border-slate-700 p-4 rounded-lg dark:text-white' onClick={() => handleOpenDrawer(contact)}>
                                <div className='flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700'>
                                    {contact?.member_id?.member_name.charAt(0)}
                                </div>
                                <div className='flex-1'>
                                    <p className='text-md'>{contact?.member_id?.member_name} <span className='font-normal'>{contact?.member_id?.rank}</span></p>
                                    <p className='text-xs'>{contact?.member_id?.team_id?.team_name}</p>
                                    <p className='text-base'>
                                        <span className=' dark:text-blue-400'>{phone}</span>
                                        <span className='pl-2 dark:text-blue-400'>{extension}</span>
                                    </p>
                                </div>
                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                    <MdKeyboardArrowRight className='text-2xl' />
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <CommonDrawer
                    isOpen={isOpen}
                    title={"프로필 정보"}
                    onClose={handleCloseDrawer}
                >
                    <div className='overflow-y-auto h-profile-screen'>
                        <div className='py-4 flex flex-col items-center gap-y-4 bg-blue-600 dark:bg-blue-900'>
                            <div className='flex justify-center items-center w-24 h-24 bg-white border border-slate-200 rounded-full dark:text-white dark:border-white dark:bg-transparent'>
                                {/* 아바타 이미지 출력 */}
                                {selectedContact?.avatar_id ? (
                                    "P"
                                ) : (
                                    "P"
                                )}
                            </div>
                            <div className='font-semibold text-xl text-white'>{selectedContact?.member_id?.member_name} <span className='font-normal'>{selectedContact?.member_id?.position}</span></div>
                        </div>
                        <div className='flex flex-col gap-y-2 w-full rounded-b-md text-sm p-8 bg-slate-200 mb-2'>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>소속</span>
                                <span className='col-span-3'>{selectedContact?.member_id?.team_id?.team_name}</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>직급</span>
                                <span className='col-span-3'>{selectedContact?.member_id?.rank}</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>이메일</span>
                                <span className='col-span-3'>{selectedContact?.member_id?.email}</span>
                            </div>
                            {/* 전화번호 출력 */}
                            {selectedContact?.phones && selectedContact.phones.map(phone => (
                                <div key={phone._id} className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>{phoneTypeMapping[phone.phone_type] || phone.phone_type}</span>
                                    <span className='col-span-3'>{phone.phone_number} {phone.phone_type === 'company_phone' && phone.extension && `(내선: ${phone.extension})`}</span>
                                </div>
                            ))}
                            {/* 날짜 정보 출력 */}
                            {selectedContact?.dates && selectedContact.dates.map(date => (
                                <div key={date._id} className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>{date.date_type}</span>
                                    <span className='col-span-3'>{new Date(date.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {/* 주소 정보 출력 */}
                            {selectedContact?.addresses && selectedContact.addresses.map(address => (
                                <div key={address._id} className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>{address.address_type}</span>
                                    <span className='col-span-3'>{address.address_line1}, {address.address_line2} (우편번호: {address.postal_code})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CommonDrawer>
            </div>
        </>
    )
}

export default Contacts;