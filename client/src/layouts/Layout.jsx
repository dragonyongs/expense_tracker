import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Tab from '../components/Tab';
import Side from '../components/Side';
import { AuthContext } from '../context/AuthProvider';

const Layout = () => {
    const { isAuthenticated, user } = useContext(AuthContext);

    // 승인된 사용자 여부를 미리 계산합니다.
    const isApprovedUser = isAuthenticated && user?.approval_status === 'approved';

    return (
        <>  
            {/* Background */}
            <div className='-z-10 fixed bg-gradient-to-r from-green-50 to-indigo-50 w-full h-full'></div>

            {/* Promotion Message */}
            <div className='hidden z-10 fixed lg:flex items-center h-screen left-desktop'>
                <Side />
            </div>

            {/* Mobile Layout */}
            <section className='lg:ml-mobile'>
                <div className={`md:max-w-xl mx-auto lg:mx-0 h-screen bg-white flex flex-col ${!isApprovedUser ? 'justify-center' : ''}`}>
                    {isApprovedUser && <Header />}
                    <div className={`${isApprovedUser ? 'flex-grow overflow-y-auto shadow-md' : 'h-full flex items-center justify-center'}`}>
                        <div className={`${isApprovedUser ? 'bg-slate-50 h-[calc(100vh-4rem-5.25rem)] p-4' : 'w-full p-6'}`}>
                            <Outlet />
                        </div>
                    </div>
                    {isApprovedUser && <Tab />}
                </div>
            </section>
        </>
    );
}

export default Layout;
