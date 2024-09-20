import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import AdminTab from '../components/AdminTab';
import TabBar from '../components/TabBar';
import Side from '../components/Side';
import { AuthContext } from '../context/AuthProvider';

const Layout = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const isApprovedUser = isAuthenticated && user?.status === 'approved';
    const location = useLocation();

    const allowedRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];

    // 현재 경로가 /admin인지 확인
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>  
            {/* Background */}
            <div className='-z-10 fixed bg-gradient-to-r from-green-50 to-indigo-50 w-full lg:h-real-screen'></div>

            {/* Promotion Message */}
            <div className='hidden z-10 fixed lg:flex items-center lg:h-real-screen left-desktop'>
                <Side />
            </div>

            {/* Mobile Layout */}
            <section className='lg:ml-mobile'>
                <div className={`h-real-screen md:max-w-xl mx-auto lg:mx-0 bg-white flex flex-col ${!isApprovedUser ? '' : 'justify-between'}`}>
                    {isApprovedUser && <Header />}
                    <div className={`overflow-y-auto shadow-md bg-slate-50 h-full ${isApprovedUser ? '' : 'flex items-center justify-center'}`}>
                        <div className={`${isApprovedUser ? 'flex flex-col relative h-full' : 'w-full h-full'}`}>
                            {/* /admin 경로일 때만 Tab 컴포넌트 렌더링 */}
                            {isAdminRoute && allowedRoles.includes(user?.role) && <AdminTab />}
                                <Outlet />
                        </div>
                    </div>
                    {isApprovedUser && <TabBar />}
                </div>
            </section>
        </>
    );
}

export default Layout;