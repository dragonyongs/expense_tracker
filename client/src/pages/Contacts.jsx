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

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    useEffect(() => {
        fetchData(API_URLS.PROFILES, setContacts);
    }, []);

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


    const addressTypeMapping = {
        work: '회사',
        home: '집',
        delivery: '배송',
    };

    const avatarConfig = selectedContact?.avatar_id;

    // 팀별로 연락처 필터링 함수
    const groupByTeam = (contacts) => {
        return contacts.reduce((groups, contact) => {
            const teamName = contact?.member_id?.team_id?.team_name || '미지정 팀';
            if (!groups[teamName]) {
                groups[teamName] = [];
            }
            groups[teamName].push(contact);
            return groups;
        }, {});
    };

    const groupedContacts = groupByTeam(contacts);

    return (
        <>
            <header className="flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800">
                <div className="text-2xl">
                    <span className="font-semibold">연락망</span>
                </div>
            </header>
            <div className="px-6 space-y-6"> {/* 팀별로 구분을 위한 마진 추가 */}
                {Object.keys(groupedContacts).map((teamName) => (
                    <div key={teamName} className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700">
                        <h3 className="dark:text-slate-400">{teamName}</h3> {/* 팀명 출력 */}
                        <ul className="flex flex-col gap-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                            {groupedContacts[teamName].map((contact) => {
                                const { extension } = getCompanyPhoneInfo(contact.phones);
                                return (
                                    <li
                                        key={contact._id}
                                        className="flex items-center gap-x-4 py-3 sm:py-4 dark:text-slate-300"
                                        onClick={() => handleOpenDrawer(contact)}
                                    >
                                        <div className="overflow-hidden flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700">
                                            {contact?.avatar_id && (
                                                <AvatarPreview avatarConfig={contact?.avatar_id} shape="circle" className="w-10 h-10" />
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
                ))}
            </div>
            <CommonDrawer isOpen={isOpen} title="프로필 정보" className="text-white bg-blue-600 dark:bg-blue-900" onClose={handleCloseDrawer}>
                <div className="overflow-y-auto h-profile-screen">
                    <div className="py-4 flex flex-col items-center gap-y-4 bg-blue-600 dark:bg-blue-900">
                        <div className="flex justify-center items-center w-24 h-24 bg-white border border-slate-200 rounded-full dark:text-white dark:border-white dark:bg-transparent">
                            {selectedContact?.avatar_id && (
                                <AvatarPreview avatarConfig={selectedContact?.avatar_id} shape="circle" />
                            )}
                        </div>
                        <div className="font-semibold text-xl text-white">
                            {selectedContact?.member_id?.member_name}{' '}
                            <span className="font-normal">{selectedContact?.member_id?.position}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-2 w-full rounded-b-md p-4 bg-slate-200 min-h-profile-screen">
                        <div className="grid grid-cols-5 w-full p-3 rounded-md bg-white border dark:border-none">
                            <span className="font-semibold text-center">소속</span>
                            <span className="col-span-4">{selectedContact?.member_id?.team_id?.team_name}</span>
                        </div>
                        <div className="grid grid-cols-5 w-full p-3 rounded-md bg-white border dark:border-none">
                            <span className="font-semibold text-center">직급</span>
                            <span className="col-span-4">{selectedContact?.member_id?.rank}</span>
                        </div>
                        <div className="grid grid-cols-5 w-full p-3 rounded-md bg-white border dark:border-none">
                            <span className="font-semibold text-center">이메일</span>
                            <span className="col-span-4">{selectedContact?.member_id?.email}</span>
                        </div>
                        {selectedContact?.phones && selectedContact.phones.map(phone => (
                            <div key={phone._id} className="grid grid-cols-5 w-full p-3 rounded-md bg-white border dark:border-none">
                                <span className="font-semibold text-center">{phoneTypeMapping[phone.phone_type] || phone.phone_type}</span>
                                <span className="col-span-4">
                                    {phone.phone_number} {phone.phone_type === 'company_phone' && phone.extension && `(내선: ${phone.extension})`}
                                </span>
                            </div>
                        ))}
                        {selectedContact?.addresses && selectedContact.addresses.map(address => (
                            <div key={address._id} className="grid grid-cols-5 w-full p-3 rounded-md bg-white border dark:border-none">
                                <span className="font-semibold text-center">{addressTypeMapping[address.address_type] || address.address_type}</span>
                                <span className="col-span-4">
                                    {address.address_line1}, {address.address_line2} ({address.postal_code})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CommonDrawer>
        </>
    );
}

export default Contacts;