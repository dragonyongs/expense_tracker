import React from 'react'
import { LuBuilding, LuSmartphone, LuHome, LuCalendarDays } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { LiaFaxSolid } from "react-icons/lia";
import { TbUserEdit } from "react-icons/tb";
import { RiSignpostLine } from "react-icons/ri";
import Avatar, { genConfig } from 'react-nice-avatar'

const Profile = () => {

    const config = genConfig({
        "sex": "man",
        "faceColor": "#F9C9B6",
        "earSize": "small",
        "eyeStyle": "circle",
        "noseStyle": "long",
        "mouthStyle": "smile",
        "shirtStyle": "polo",
        "glassesStyle": "none",
        "hairColor": "#000",
        "hairStyle": "thick",
        "hatStyle": "none",
        "hatColor": "#D2EFF3",
        "eyeBrowStyle": "up",
        "shirtColor": "#9287FF",
        "bgColor": "#6BD9E9",
    });

    return (
        <>
            <div className='flex flex-col gap-y-4 p-4 bg-slate-200 dark:bg-slate-800'>

                <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                    <div className='absolute top-6 right-6 text-md text-slate-500'>
                        입사 N년차
                    </div>
                    <div className='flex justify-center items-center w-24 h-24 bg-slate-100 rounded-xl overflow-hidden'>
                        <Avatar className="w-full h-full rounded-none" style={{borderRadius: 'none'}} {...config} />
                    </div>
                    <div className='font-bold text-3xl'>
                        안대용
                    </div>

                    <div>
                        <p className='text-slate-800'>
                            1985.12.19(양)
                        </p>
                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRicch Advisor</span> 퍼블리싱팀 팀장</p>
                        <p className='text-slate-500'>What is good today, may be a cliche tomorrow.</p>
                    </div>
                    <div className='flex gap-x-3 mt-4'>
                        <button className='w-5/12 py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>카드 이미지</button>
                        <button className='w-5/12 py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-100' disabled>QR 연락처</button>
                        <button className='flex justify-center w-2/12 py-3 border border-blue-700 font-semibold text-blue-700 rounded-md active:bg-blue-50 active:border-blue-100 active:text-blue-400'><TbUserEdit className='w-6 h-6'/></button>
                    </div>
                </div>

                {/* <h3 className='mt-4 font-semibold text-2xl'>연락처</h3> */}
                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <AiOutlineMail /><span className='w-10 text-nowrap'>메일</span>
                            </div>
                            <span className=''>ujudge@naver.com</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuBuilding /><span className='w-10 text-nowrap'>회사</span>
                            </div>
                            <span className=''>02-0000-0000 (155)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuSmartphone /><span className='w-10 text-nowrap'>업무</span>
                            </div>
                            <span className=''>010-0000-0000</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuSmartphone /><span className='w-10 text-nowrap'>개인</span>
                            </div>
                            <span className=''>010-0000-0000</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LiaFaxSolid /><span className='w-10 text-nowrap'>팩스</span>
                            </div>
                            <span className=''>02-569-8470</span>
                        </li>
                    </ul>
                </div>

                {/* <h3 className='mt-4 font-semibold text-2xl'>주소</h3> */}
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
                            <span className=''>서울시 동대문구 약령시로21길 23, 1동 905호(청량리동)</span>
                        </li>
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <RiSignpostLine /><span className='w-7 text-nowrap'>택배</span>
                            </div>
                            <span className=''>서울시 강남구 강남대로62길 3, 한진빌딩 5층</span>
                        </li>
                    </ul>
                </div>

                {/* <h3 className='mt-4 font-semibold text-2xl'>정보</h3> */}
                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <LuCalendarDays /><span className='w-7 text-nowrap'>입사</span>
                            </div>
                            <span className=''>2022년 10월 2일</span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Profile;