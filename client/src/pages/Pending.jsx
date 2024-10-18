import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { PiStarFourFill } from "react-icons/pi";
import { IoIosArrowBack } from "react-icons/io";

const Pending = () => {
    const { user, logout } = useContext(AuthContext);  // logout 함수 가져오기
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();  // 로그아웃 처리
        navigate('/signin');  // 로그아웃 후 로그인 페이지로 이동
    };

    return (
        <>
            <div className='flex items-center w-full h-12 bg-white'>
                <button className="px-2" onClick={handleLogout}><IoIosArrowBack className='w-6 h-6' /></button>
                <p className='flex-1 w-full -translate-x-4 text-center font-semibold text-black text-xl'>가입 신청 완료</p>
            </div>
            <div className='relative flex flex-col justify-center items-center h-pending-screen w-ful'>
                <div className='relative flex-1 w-full px-8 pt-10'>
                    <div className='flex justify-center items-center w-20 h-20 mb-8 rounded-full bg-newBlue text-white'>
                        <PiStarFourFill className='w-12 h-12' />
                    </div>
                    <h1 className='mb-7 text-3xl leading-tight dark:text-slate-200'>
                        <span className='text-blue-400'>{user.name}</span>님은<br />
                        현재 관리자의 승인을<br />
                        기다리고 있습니다.
                    </h1>
                    <div className='absolute bottom-8 -right-6 w-60 h-auto dark:invert'>
                        <img src="../pending.png" alt="pending" />
                    </div>
                </div>
                <div className='w-full'>
                    <button 
                        onClick={handleLogout}  // 로그아웃 버튼 클릭 시 handleLogout 호출
                        className="w-full px-5 py-4 me-2 text-white bg-black hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium text-md dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                        승인 대기 중
                    </button>
                </div>
            </div>
        </>
    )
}

export default Pending;