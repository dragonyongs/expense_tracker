import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
// import { MdLogout } from "react-icons/md";
// import { useNavigate } from 'react-router-dom';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';

const Dashboard = () => {
    // const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // const handleLogout = async () => {
    //     await logout();
    //     navigate('/signin');
    // }

    return (
        <>  
            {user.role === ('super_admin') ? (
                <div className='p-8'>
                    <p>{user.role}</p>
                </div>
            ) : (
                <div>
                    <CardBalance role={user.role} />
                    <PayHistory />
                </div>
            ) }
            

            {/* <div className='p-6'>
                <h1>Dashboard</h1>
                {user ? (
                    <div>
                        <p>이름: {user.name}</p>
                        <p>이메일: {user.email}</p>
                        <p>권한: {user.role}</p>
                        <p>상태: {user.status}</p>
                    </div>
                ) : (
                    <p>사용자 정보를 불러오는 중입니다...</p>
                )}

                <button type="button" className='mt-4 flex flex-col items-center' onClick={handleLogout}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <MdLogout className="text-2xl" />
                    </div>
                    <span className="text-sm">로그아웃</span>
                </button>
            </div> */}
        </>
    );
};

export default Dashboard;
