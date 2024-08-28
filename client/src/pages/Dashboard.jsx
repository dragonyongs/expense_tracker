import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className='p-6'>
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
        </div>
    );
};

export default Dashboard;
