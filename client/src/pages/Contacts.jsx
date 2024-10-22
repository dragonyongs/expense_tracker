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

    const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

    const genders = ['man', 'woman'];
    const hairStyles = ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'];
    const bgColors = ['#ffedef', '#e8fcbf', '#fcf7c7']; // 원하는 배경 색상 추가
    const noAvatar = {
        sex: getRandomElement(genders), // 랜덤 성별
        faceColor: '#F9CBAE', // 피부색 (고정)
        earSize: 'normal', // 귀 크기 (고정)
        hairColor: getRandomElement(['#4A3C3A', '#C2B280', '#A52A2A']), // 랜덤 머리 색상
        hairStyle: getRandomElement(hairStyles), // 랜덤 머리 스타일
        hairColorRandom: '', // 랜덤 머리 색상 (비워둠)
        hatColor: '', // 모자 색상 (고정)
        hatStyle: '', // 모자 스타일 (고정)
        eyeStyle: 'oval', // 눈 스타일 (고정)
        glassesStyle: '', // 안경 스타일 (고정)
        noseStyle: 'normal', // 코 스타일 (고정)
        mouthStyle: 'smile', // 입 스타일 (고정)
        shirtStyle: 'tshirt', // 티셔츠 스타일 (고정)
        shirtColor: '#3B5998', // 티셔츠 색상 (고정)
        bgColor: getRandomElement(bgColors), // 랜덤 배경 색상
        isGradient: false // 그라데이션 여부 (고정)
    };
    
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
                                        className="flex items-center gap-x-4 py-3 sm:py-4 cursor-pointer active:scale-98 active:bg-gray-50 dark:active:bg-slate-500 active:px-2 active:rounded-md dark:text-slate-300"
                                        onClick={() => handleOpenDrawer(contact)}
                                    >
                                        <div className="overflow-hidden flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700">
                                            {contact?.avatar_id ? (
                                                <AvatarPreview avatarConfig={ contact?.avatar_id } shape="circle" className="w-10 h-10"/>
                                            ) : (
                                                <AvatarPreview avatarConfig={ noAvatar } shape="circle" className="w-10 h-10"/>
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
            <CommonDrawer isOpen={isOpen} title="프로필 정보" className="text-white bg-starBlue  dark:bg-indigo-900" onClose={handleCloseDrawer}>
                <div className="overflow-y-auto h-profile-screen">
                    <div className="py-4 flex flex-col items-center gap-y-4 bg-starBlue dark:bg-indigo-900">
                        <div className="flex justify-center items-center w-24 h-24 bg-white border border-slate-200 rounded-full dark:text-white dark:border-white dark:bg-transparent">
                            {selectedContact?.avatar_id ? (
                                <AvatarPreview avatarConfig={selectedContact?.avatar_id} shape="circle" />
                            ) : (
                                <AvatarPreview avatarConfig={ noAvatar } shape="circle" />
                            )}
                        </div>
                        <div className="font-semibold text-xl text-white">
                            {selectedContact?.member_id?.member_name}{' '}
                            <span className="font-normal">{selectedContact?.member_id?.position}</span>
                        </div>
                    </div>
                    <div className="flex flex-col w-full rounded-b-md p-4 min-h-profile-screen dark:bg-slate-700 dark:text-slate-300">
                        <ul className='flex flex-col gap-y-2 divide-y divide-gray-200 dark:divide-gray-600'>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="font-semibold text-center">소속</span>
                                <span className="col-span-4">{selectedContact?.member_id?.team_id?.team_name}</span>
                            </li>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="font-semibold text-center">직급</span>
                                <span className="col-span-4">{selectedContact?.member_id?.rank}</span>
                            </li>
                            <li className="grid grid-cols-5 w-full p-3">
                                <span className="font-semibold text-center">이메일</span>
                                <span className="col-span-4">{selectedContact?.member_id?.email}</span>
                            </li>
                            {selectedContact?.phones && selectedContact.phones.map(phone => (
                                <li key={phone._id} className="grid grid-cols-5 w-full p-3">
                                    <span className="font-semibold text-center">{phoneTypeMapping[phone.phone_type] || phone.phone_type}</span>
                                    <span className="col-span-4">
                                        {phone.phone_number} {phone.phone_type === 'company_phone' && phone.extension && `(내선: ${phone.extension})`}
                                    </span>
                                </li>
                            ))}
                            {selectedContact?.addresses && selectedContact.addresses.map(address => (
                                <li key={address._id} className="grid grid-cols-5 w-full p-3">
                                    <span className="font-semibold text-center">{addressTypeMapping[address.address_type] || address.address_type}</span>
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