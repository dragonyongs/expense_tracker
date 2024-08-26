import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Pending = () => {
    const { user, logout } = useContext(AuthContext);  // logout 함수 가져오기
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();  // 로그아웃 처리
        navigate('/signin');  // 로그아웃 후 로그인 페이지로 이동
    };

    return (
        <div className='relative flex items-center w-full h-full'>
            <div className='w-full'>
                <div className='mb-28'>
                    <div className='flex justify-center items-center w-20 h-20 mb-10 rounded-full bg-newBlue text-white'>
                        <img src="/pig-piggy-bank.svg" className='w-10 h-10'/>
                    </div>
                    <h1 className='mb-7 text-3xl leading-snug'>
                        {user.name}님,<br />
                        현재 관리자의 승인을<br />
                        기다리고 있습니다.
                    </h1>
                    <button 
                        onClick={handleLogout}  // 로그아웃 버튼 클릭 시 handleLogout 호출
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Pending;