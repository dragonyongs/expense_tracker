import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);  // logout 함수 가져오기
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();  // 로그아웃 처리
        navigate('/signin');  // 로그아웃 후 로그인 페이지로 이동
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {user ? (
                <div>
                    <p>이름: {user.name}</p>
                    <p>이메일: {user.email}</p>
                </div>
            ) : (
                <p>사용자 정보를 불러오는 중입니다...</p>
            )}
            <button 
                onClick={handleLogout}  // 로그아웃 버튼 클릭 시 handleLogout 호출
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
                로그아웃
            </button>
        </div>
    );
};

export default Dashboard;
