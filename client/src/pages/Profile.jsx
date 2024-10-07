import React from 'react'
import { LuBuilding, LuSmartphone, LuHome } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";

const Profile = () => {
    return (
        <>
            <div className='flex flex-col gap-y-4 p-4 bg-slate-200'>

                <div className='relative flex flex-col gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm'>
                    <div className='absolute top-6 right-6 text-md text-slate-500'>
                        입사 2년차
                    </div>
                    <div className='flex justify-center items-center w-24 h-24 bg-slate-100 rounded-xl'>
                        Avatar
                    </div>
                    <div className='font-bold text-3xl'>
                        안대용
                    </div>

                    <div>
                        <p className='text-slate-800'>
                            1985.12.19(양)
                        </p>
                        <p className='text-slate-500'><span className='font-semibold text-slate-800'>StarRich.co.kr</span> 퍼블리싱팀 팀장</p>
                        <p className='text-slate-500'>지속가능성과 사용성을 중시하는 퍼블리셔</p>
                    </div>
                    <div>
                        <button className='w-full py-2 bg-blue-700 text-white rounded-xl active:bg-blue-800'>연락처 공유</button>
                    </div>
                </div>

                <h3 className='mt-4 font-semibold text-2xl'>연락처</h3>
                <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm'>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className='flex items-center gap-x-4 py-3 sm:py-4'>
                            <div className='flex items-center space-x-2 px-2 font-semibold'>
                                <AiOutlineMail /><span className='w-10 text-nowrap'>이메일</span>
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
                    </ul>
                </div>

                <h3 className='mt-4 font-semibold text-2xl'>주소</h3>
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
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Profile