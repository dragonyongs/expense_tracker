import React, { useEffect, useState, useMemo } from 'react'
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import { MdKeyboardArrowRight } from "react-icons/md";
import CommonDrawer from '../components/CommonDrawer';
import AvatarPreview from '../components/AvatarPreview';
import { genConfig } from 'react-nice-avatar';

function Contacts() {
    const [contacts, setContacts ] = useState([]);
    const [selectedContact, setSelectedContact] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await axios.get(API_URLS.PROFILES);
                setContacts(data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };
        fetchContacts();
    }, []);

    const handleOpenDrawer = (contact) => {
        setSelectedContact(contact);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => setIsOpen(false);

    const getCompanyPhoneInfo = (phones) => {
        const companyPhone = phones.find(phone => phone.phone_type === 'company_phone');
        return companyPhone ? { phone: companyPhone.phone_number, extension: companyPhone.extension } : {};
    };

    // 팀별로 연락처 필터링 함수
    const groupByTeam = (contacts) => {
        return contacts.reduce((groups, contact) => {
            const teamName = contact?.member_id?.team_id?.team_name || '미지정팀';
            
            if (teamName !== '미지정팀') {
                groups[teamName] = groups[teamName] || [];
                groups[teamName].push(contact);
            }

            return groups;
        }, {});
    };

    const groupedContacts = useMemo(() => groupByTeam(contacts), [contacts]);

    const phoneTypeMapping = {
        company_phone: '회사',
        personal_mobile: '개인',
        fax: '팩스',
    };


    const addressTypeMapping = {
        work: '근무',
        home: '집',
        delivery: '배송',
    };

    return (
        <>
            <header className="flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800">
                <div className="text-2xl">
                    <span className="font-semibold">연락망</span>
                </div>
            </header>
            <div className="pb-6 px-4 space-y-3">
                {groupedContacts.length === 0 ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <p className="font-semibold text-center">연락망의 데이터가 없습니다.</p>
                    </div>
                ) : (
                    Object.keys(groupedContacts).map((teamName) => (
                        <div key={teamName} className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700">
                            <h3 className="dark:text-slate-400">{teamName}</h3> {/* 팀명 출력 */}
                            <ul className="flex flex-col gap-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                                {groupedContacts[teamName].map((contact) => {
                                    const { extension } = getCompanyPhoneInfo(contact.phones);
    
                                    return (
                                        <li
                                            key={contact._id}
                                            className="flex items-center gap-x-4 py-3 sm:py-4 cursor-pointer active:scale-98 active:bg-gray-50 dark:active:bg-slate-500 active:px-2 active:rounded-md dark:text-slate-300"
                                            onClick={() => handleOpenDrawer(contact)}
                                        >
                                            <div className="overflow-hidden flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700">
                                                {contact?.avatar_id ? (
                                                    <AvatarPreview avatarConfig={ contact?.avatar_id } shape="circle" className="w-10 h-10"/>
                                                ) : (
                                                    <AvatarPreview avatarConfig={ genConfig() } shape="circle" className="w-10 h-10"/>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-lg">
                                                    {contact?.member_id?.member_name} <span className="font-normal">{contact?.member_id?.rank}</span>{' '}
                                                    {extension && <span className="dark:text-blue-300">({extension})</span>}
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                <MdKeyboardArrowRight className="text-2xl" />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))
                )}
                
            </div>
            <CommonDrawer isOpen={isOpen} title="프로필 정보" className="text-white bg-starBlue  dark:bg-indigo-900" onClose={handleCloseDrawer}>
                <div className="overflow-y-auto h-profile-screen">
                    <div className="py-4 flex flex-col items-center gap-y-4 bg-starBlue dark:bg-indigo-900">
                        <div className="flex justify-center items-center w-24 h-24 bg-white border border-slate-200 rounded-full dark:text-white dark:border-white dark:bg-transparent">
                            {selectedContact?.avatar_id ? (
                                <AvatarPreview avatarConfig={selectedContact?.avatar_id} shape="circle" />
                            ) : (
                                <AvatarPreview avatarConfig={ genConfig() } shape="circle" />
                            )}
                        </div>
                        <div className="font-semibold text-xl text-white">
                            {selectedContact?.member_id?.member_name}{' '}
                            <span className="font-normal">{selectedContact?.member_id?.position}</span>
                        </div>
                        {selectedContact?.introduction ? (
                            <div className='w-10/12 py-2 px-4 bg-blue-100 text-black text-center rounded-md'>
                                {selectedContact.introduction}
                            </div>
                        ) : null}

                    </div>
                    <div className="w-full rounded-b-md p-4 dark:bg-slate-700 dark:text-slate-300">
                        <ul className='flex flex-col gap-y-2 divide-y divide-gray-200 dark:divide-gray-600'>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="pl-2 font-semibold">소속</span>
                                <span className="col-span-4">{selectedContact?.member_id?.team_id?.team_name}</span>
                            </li>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="pl-2 font-semibold">직급</span>
                                <span className="col-span-4">{selectedContact?.member_id?.rank}</span>
                            </li>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="pl-2 font-semibold">메일</span>
                                <span className="col-span-4">{selectedContact?.member_id?.email}</span>
                            </li>
                            {selectedContact?.phones && selectedContact.phones.map(phone => (
                                <li key={phone._id} className="grid grid-cols-5 w-full p-3">
                                    <span className="pl-2 font-semibold">{phoneTypeMapping[phone.phone_type] || phone.phone_type}</span>
                                    <span className="col-span-4">
                                        {phone.phone_number} {phone.phone_type === 'company_phone' && phone.extension && `(내선: ${phone.extension})`}
                                    </span>
                                </li>
                            ))}
                            {selectedContact?.addresses && selectedContact.addresses
                                .filter(address => address.address_type === 'work')
                                .map(address => (
                                    <li key={address._id} className="grid grid-cols-5 w-full p-3">
                                        <span className="pl-2 font-semibold">{addressTypeMapping[address.address_type] || address.address_type}</span>
                                        <span className="col-span-4">
                                            {address.address_line1}, {address.address_line2} ({address.postal_code})
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            </CommonDrawer>
        </>
    );
}

export default Contacts;