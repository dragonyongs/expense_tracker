import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import { MdKeyboardArrowRight } from "react-icons/md";
import CommonDrawer from '../components/CommonDrawer';

function Contacts() {
    const [members, setMEmbers ] = useState([]);
    const [selectedContact, setSelectedContact] = useState("");
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
        <>
            <header className={`flex justify-between items-center py-4 px-6 text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>연락망</span>
                </div>
            </header>
            <div className='p-6'>
                <ul className='flex flex-col gap-y-1'>
                    { members.map((member)=> (
                        <li key={member._id} className='flex items-center gap-x-4 bg-white dark:bg-slate-700 border border-slate-100 cursor-pointer dark:border-slate-700 p-4 rounded-lg dark:text-white' onClick={()=>handleOpenDrawer(member)}>
                            <div className='flex justify-center items-center w-10 h-10 bg-white border border-slate-200 dark:border-slate-500 rounded-full dark:text-slate-500 dark:bg-slate-700 '>
                                { member.member_name.charAt(0)}
                            </div>
                            <div className='flex-1'>
                                <p className='text-md'>{member.member_name} <span className='font-thin'>{member.rank}</span></p>
                                <p className='text-xs'>{member.email}</p>
                                {/* <span className='pl-2 dark:text-blue-400'>내선 155</span> */}
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
                    // size={"100%"}
                    onClose={handleCloseDrawer}
                    >
                        <div className='overflow-y-auto h-profile-screen'>
                            <div className='py-4 flex flex-col items-center gap-y-4 bg-blue-600 dark:bg-blue-900'>
                                <div className='flex justify-center items-center w-24 h-24 bg-white border border-slate-200 rounded-full dark:text-white dark:border-white dark:bg-transparent'>
                                    P
                                </div>
                                <div className='font-semibold text-xl text-white'>{selectedContact?.member_name} <span className='font-normal'>{selectedContact?.position}</span></div>
                            </div>
                            <div className='flex flex-col gap-y-2 w-full rounded-b-md text-sm p-8 bg-slate-200 mb-2'>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>소속</span>
                                    <span className='col-span-3'>{selectedContact?.team_id?.team_name}</span>
                                </div>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>직급</span>
                                    <span className='col-span-3'>{selectedContact?.rank}</span>
                                </div>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>이메일</span>
                                    <span className='col-span-3'>{selectedContact?.email}</span>
                                </div>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>권한</span>
                                    <span className='col-span-3'>{selectedContact?.role_id?.role_description}</span>
                                </div>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>상태</span>
                                    <span className='col-span-3'>{selectedContact?.status_id?.status_description}</span>
                                </div>
                            </div>
                            {/* <div className='flex flex-col gap-y-2 w-full rounded-md text-sm p-8 bg-slate-200'>
                                <div className='grid grid-cols-4 w-full p-3 rounded-md bg-white border dark:border-none'>
                                    <span className='font-semibold'>기타</span>
                                    <span className='col-span-3'>-</span>
                                </div>
                            </div> */}
                        </div>
                    </CommonDrawer>
            </div>
        </>
    )
}

export default Contacts