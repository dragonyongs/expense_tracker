import React, { useEffect, useState, useMemo } from 'react'
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import { MdKeyboardArrowRight } from "react-icons/md";
import CommonDrawer from '../components/CommonDrawer';
import AvatarPreview from '../components/AvatarPreview';
import { genConfig } from 'react-nice-avatar';
import { MutatingDots } from 'react-loader-spinner';
import { formatDateToKorean, isTodayBirthday, calculateYearsSinceEntry } from '../utils/dateUtils';
import { renderContactIcon, renderContactLabel, renderDateIcon, renderDateLabel, renderAddressIcon, renderAddressLabel } from '../utils/profileRenderUtils';
import { filterDataBySearchTerm } from '../utils/search';
import SearchInput from '../components/SearchInput';

function Contacts() {
    const [contacts, setContacts] = useState([]); // 전체 데이터를 저장
    const [filteredContacts, setFilteredContacts] = useState([]); // 검색된 결과를 저장
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYears, setSelectedYears] = useState('');
    const [selectedDays, setSelectedDays] = useState('');
    const [selectedContact, setSelectedContact] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);

            try {
                const { data } = await axios.get(API_URLS.PROFILES);
                const filtered = data.filter(contact => contact?.member_id?.role_id?.role_name !== 'former_employee');
                setContacts(filtered);
                setFilteredContacts(filtered);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            } finally {
            setIsLoading(false);
        }
        };
        fetchContacts();
    }, []);

    const handleOpenDrawer = (contact) => {
        const { years, days } = calculateYearsSinceEntry(contact.dates);
    
        // 날짜 데이터 시간순 정렬
        const sortedDates = contact.dates.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        setSelectedYears(years);
        setSelectedDays(days);
        setSelectedContact({
            ...contact,
            dates: sortedDates
        });
        setIsOpen(true);
    };

    const handleCloseDrawer = () => setIsOpen(false);

    const getCompanyPhoneInfo = (phones) => {
        const companyPhone = phones.find(phone => phone.phone_type === 'company_phone');
        return companyPhone ? { phone: companyPhone.phone_number, extension: companyPhone.extension } : {};
    };
    
    const getWorkCity = (addresses) => {
        if (addresses && Array.isArray(addresses)) {
            const workAddress = addresses.find(address => address.address_type === 'work');
            
            if (workAddress) {
                const parts = workAddress.address_line1.split(' ');
                const cityCode = parts[0].slice(0, 2);
                return { city: cityCode};
            } else {
                return { city: '' };
            }
        } else {
            console.error('Addresses is undefined or not an array');
            return { city: '' };
        }
    };

    const priorityTeams = ["경영지원본부(임원)", "영엽지원본부(임원)", "경영지원팀", "마케팅팀", "총무팀", "섭외팀"];

    const sortContacts = (contacts) => {
        const rankOrder = ['대표이사', '전무', '상무', '이사', '실장', '부장', '편집장', '차장', '과장', '대리', '사원'];

        return contacts.sort((a, b) => {
            const rankA = a?.member_id?.rank;
            const rankB = b?.member_id?.rank;
    
            // 대표는 항상 최우선
            if (rankA === '대표이사' && rankB !== '대표이사') return -1;
            if (rankB === '대표이사' && rankA !== '대표이사') return 1;
    
            // 내선번호 여부 확인 (대표 제외)
            const hasExtensionA = !!getCompanyPhoneInfo(a?.phones).extension;
            const hasExtensionB = !!getCompanyPhoneInfo(b?.phones).extension;
    
            if (rankA !== '대표이사' && rankB !== '대표이사') {
                if (hasExtensionA && !hasExtensionB) return -1;
                if (!hasExtensionA && hasExtensionB) return 1;
            }
    
            // 직급 순서 정렬
            return rankOrder.indexOf(rankA) - rankOrder.indexOf(rankB);
        });
    };
    
    const groupByTeam = (contacts) => {
        const sortedContacts = sortContacts(contacts);

        // 그룹화 작업
        const grouped = sortedContacts.reduce((groups, contact) => {
            const teamName = contact?.member_id?.team_id?.team_name || "미지정팀";
            groups[teamName] = groups[teamName] || [];
            groups[teamName].push(contact);
            return groups;
        }, {});
    
        // 우선순위 팀 정렬
        const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
            const priorityA = priorityTeams.indexOf(a);
            const priorityB = priorityTeams.indexOf(b);
    
            // 우선순위 배열에 있는 팀은 배열 순서대로 정렬
            if (priorityA !== -1 && priorityB !== -1) {
                return priorityA - priorityB;
            }
            // 배열에 없는 팀은 우선순위 팀 다음에 알파벳순 정렬
            if (priorityA !== -1) return -1;
            if (priorityB !== -1) return 1;
            return a.localeCompare(b);
        });
    
        // 우선순위에 맞게 그룹 재구성
        const sortedGroupedContacts = {};
        sortedGroupKeys.forEach((key) => {
            sortedGroupedContacts[key] = grouped[key];
        });
    
        return sortedGroupedContacts;
    };


    const handleSearch = (field, term) => {
        setSearchTerm(term);

        if (!term) {
            setFilteredContacts(contacts);
        } else {
            const filtered = filterDataBySearchTerm(contacts, field, term);
            setFilteredContacts(filtered);
        }
    };

    const groupedContacts = useMemo(() => groupByTeam(filteredContacts), [filteredContacts]);
    const isNoResults = groupedContacts && Object.keys(groupedContacts).length === 0;
    
    return (
        <>
            <header className="flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800">
                <div className="text-2xl">
                    <span className="font-semibold">연락망</span>
                </div>
            </header>
            <div className="pb-24 px-4 space-y-3">

            {isLoading ? (
                <div className="flex flex-col items-center justify-center bg-white rounded-lg h-drawer-screen">
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
                groupedContacts.length === 0 ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <p className="font-semibold text-center">연락망의 데이터가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <SearchInput onSearch={handleSearch} />
                        {isNoResults ? (
                            <div className="flex justify-center items-center p-4 min-h-96 bg-slate-100 dark:bg-slate-700 rounded-md">
                                <p className="text-lg text-slate-700"><span className='font-bold text-slate-900'>{searchTerm}</span>의 검색 결과가 없습니다.</p>
                            </div>
                        ) : (
                            Object.keys(groupedContacts).map((teamName) => (
                                <div key={teamName} className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-700">
                                    <h3 className="dark:text-slate-400">{teamName} <span className='font-normal text-gray-600'>{groupedContacts[teamName].length}명</span></h3> {/* 팀명 출력 */}
                                    <ul className="flex flex-col gap-y-1 divide-y divide-gray-200 dark:divide-gray-600">
                                        {groupedContacts[teamName].map((contact) => {
                                            const { extension } = getCompanyPhoneInfo(contact.phones);
                                            const { city } = getWorkCity(contact.addresses);

                                            const formerEmployee = contact?.member_id?.role_id?.role_name === 'former_employee';
                                            const hiredMember = contact?.member_id?.status_id?.status_name === 'hired';
                                            const entryDate = contact.dates?.find((date) => date.date_type === 'entry')?.date;
                                            const formattedEntryDate = entryDate
                                                ? new Date(entryDate).toLocaleDateString('ko-KR', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                })
                                                : null;
                                            const isFutureDate = entryDate && new Date(entryDate) > new Date();
                                            return (
                                                <li
                                                    key={contact._id}
                                                    className={`flex items-center gap-x-4 py-3 sm:py-4 cursor-pointer active:scale-98 active:bg-gray-50 dark:active:bg-slate-500 active:px-2 active:rounded-md dark:text-slate-300 ${formerEmployee ? 'text-slate-300' : '' }`}
                                                    onClick={() => handleOpenDrawer(contact)}
                                                >
                                                    <div className="overflow-hidden flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700">
                                                        {contact?.avatar_id ? (
                                                            <AvatarPreview avatarConfig={ contact?.avatar_id } shape="circle" className={`w-10 h-10 ${formerEmployee ? 'opacity-40' : ''}`} />
                                                        ) : (
                                                            <AvatarPreview avatarConfig={ genConfig() } shape="circle" className="w-10 h-10"/>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-lg">
                                                            {contact?.member_id?.member_name} <span className="font-normal">{contact?.member_id?.rank}</span>{' '}
                                                            {extension && <span className="dark:text-blue-300">({extension})</span>}
                                                            {city && city !== '서울' && <span className="text-blue-700 dark:text-blue-300">({city})</span>}
                                                            {hiredMember && isFutureDate && formattedEntryDate && (
                                                                <span className="inline-block ml-2 text-blue-500 text-sm font-normal">
                                                                    ({`입사 예정일: ${formattedEntryDate}`})
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                        <MdKeyboardArrowRight className={`text-2xl ${formerEmployee ? 'text-slate-300' : ''}`} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))
                        )}
                    </>
                    
                )
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
                        <div className="flex gap-x-2 font-semibold text-xl text-white">
                            {selectedContact?.member_id?.member_name}
                            <span className="font-normal">{selectedContact?.member_id?.position}</span>
                            {selectedYears >= 0 && selectedDays > 0 && 
                                <span className='font-normal'>
                                    ({selectedYears > 1 
                                                ? `${selectedYears}년차` 
                                                : (selectedDays > 0 && `${selectedDays}일차`)})
                                </span>
                            }
                        </div>
                        {selectedContact?.introduction ? (
                            <div className='w-10/12 py-2 px-4 bg-transparent text-white text-center'>
                                {selectedContact.introduction}
                            </div>
                        ) : null}

                    </div>
                    <div className="w-full rounded-b-md p-4 dark:bg-slate-700 dark:text-slate-300">
                        <ul className='flex flex-col gap-y-2 divide-y divide-gray-200 dark:divide-gray-600'>
                            <li className="grid grid-cols-4 w-full p-3">
                                <span className="pl-2 font-semibold">소속</span>
                                <span className="col-span-3">{selectedContact?.member_id?.team_id?.team_name}</span>
                            </li>
                            <li className="grid grid-cols-4 w-full p-3">
                                <span className="pl-2 font-semibold">직급</span>
                                <span className="col-span-3">{selectedContact?.member_id?.rank}</span>
                            </li>
                            <li className="grid grid-cols-4 w-full p-3">
                                <span className="pl-2 font-semibold">메일</span>
                                <span className="col-span-3">{selectedContact?.member_id?.email}</span>
                            </li>
                            {selectedContact?.dates && selectedContact.dates
                                .filter(date => date.date_type === "birthday")
                                .map(date => (
                                    <li key={date._id} className="grid grid-cols-4 w-full p-3">
                                        <span className="pl-2 font-semibold">{renderDateLabel(date.date_type)}</span>
                                        <span className="col-span-3">
                                            {formatDateToKorean(date.date)}
                                        </span>
                                    </li>
                                ))}
                            {selectedContact?.phones && selectedContact.phones.map(phone => (
                                <li key={phone._id} className="grid grid-cols-4 w-full p-3">
                                    <span className="pl-2 font-semibold">{renderContactLabel(phone.phone_type)}</span>
                                    <span className="col-span-3">
                                        {phone.phone_number} {phone.phone_type === 'company_phone' && phone.extension && `(내선: ${phone.extension})`}
                                    </span>
                                </li>
                            ))}

                            {selectedContact?.addresses && selectedContact.addresses
                                .filter(address => address.address_type === 'work')
                                .map(address => (
                                    <li key={address._id} className="grid grid-cols-4 w-full p-3">
                                        <span className="pl-2 font-semibold">{renderAddressLabel(address.address_type)}</span>
                                        <span className="col-span-3">
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