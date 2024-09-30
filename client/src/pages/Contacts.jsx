import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import { MdKeyboardArrowRight } from "react-icons/md";
import CommonDrawer from '../components/CommonDrawer';

function Contacts() {
    const [members, setMEmbers ] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(API_URLS.MEMBERS);
            const contacts = response.data.filter(member => member.role_id.role_name !== 'super_admin');
            console.log(contacts);
            setMEmbers(contacts); 
        } catch (error) {
            console.error('Error fetching memebers: ', error);
        }
    };

    const handleOpenDrawer = (member) => {
        setSelectedContact({
            ...member
        });
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        console.log('Closing drawer');
        setIsOpen(false);
    };

    return (
        <div className='p-8'>
            <p className='pb-4 dark:text-white'>Contacts</p>
            <ul className='flex flex-col gap-y-1'>
                { members.map((member)=> (
                    <li key={member._id} className='flex items-center gap-x-4 bg-white dark:bg-slate-700 border border-slate-100 cursor-pointer dark:border-slate-700 p-4 rounded-lg dark:text-white' onClick={()=>handleOpenDrawer(member)}>
                        <div className='flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700 '>
                            { member.member_name.charAt(0)}
                        </div>
                        <div className='flex-1'>
                            <p className='text-sm'>{member.member_name}</p>
                            <p className='text-xs'>02-6969-0000<span className='pl-2 dark:text-blue-400'>내선 155</span></p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <MdKeyboardArrowRight className='text-2xl' />
                        </div>
                    </li>
                ))}
            </ul>

            <CommonDrawer
                isOpen={isOpen}
                title={"프로필 정보"}
                size={"409px"}
                onClose={handleCloseDrawer}
                >
                    <div className='overflow-y-auto h-profile-screen'>
                        <div className='py-4 flex flex-col items-center gap-y-4 bg-blue-600 dark:bg-blue-900'>
                            <div className='flex justify-center items-center w-24 h-24 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700 '>
                                P
                            </div>
                            <div className='font-semibold text-xl text-white'>홍길동 팀장</div>
                        </div>
                        <div className='flex flex-col gap-y-2 w-full rounded-md text-sm p-8 bg-slate-200'>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>소속</span>
                                <span className='col-span-3'>경영지원본부 퍼블리싱팀</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>직급</span>
                                <span className='col-span-3'>차장</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>이메일</span>
                                <span className='col-span-3'>emaail@starrich.co.kr</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>휴대폰</span>
                                <span className='col-span-3'>010-0000-0000</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>사무실</span>
                                <span className='col-span-3'>02-6969-0000 (155)</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>근무지</span>
                                <span className='col-span-3'>서울특별시 강남구 강남대로62길 23, 3층 역삼빌딩</span>
                            </div>
                            <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                <span className='font-semibold'>기타</span>
                                <span className='col-span-3'>-</span>
                            </div>
                        </div>
                    </div>
                </CommonDrawer>
        </div>
    )
}

export default Contacts