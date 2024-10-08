import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { useLocation } from 'react-router-dom';
import AdminTab from '../components/AdminTab';
import { TbView360Arrow } from "react-icons/tb";

const AdminHader = () => {
    const { user } = useContext(AuthContext);
    const allowedRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];

    // 현재 경로가 /admin인지 확인
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>
            <header className={`flex justify-between items-center py-4 px-6 bg-white dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>관리자</span>
                </div>
            </header>
            {/* /admin 경로일 때만 Tab 컴포넌트 렌더링 */}
            {isAdminRoute && allowedRoles.includes(user?.role) && <AdminTab />}
        </>
    )
}

export default AdminHader;