import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import TabBar from '../components/TabBar';
import Side from '../components/Side';
import { AuthContext } from '../context/AuthProvider';

const Layout = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const isApprovedUser = isAuthenticated && user?.status === 'approved';

    return (
        <>  
            {/* Background */}
            <div className='-z-10 fixed bg-gradient-to-r from-green-50 to-indigo-50 w-full lg:h-real-screen dark:from-slate-950 dark:to-slate-950'></div>

            {/* Promotion Message */}
            <div className='hidden z-10 fixed lg:flex items-center lg:h-real-screen left-desktop'>
                <Side />
            </div>

            {/* Mobile Layout */}
            <section className='lg:ml-mobile bg-blue-50 dark:bg-slate-700'>
                <div className={`h-real-screen md:max-w-xl mx-auto lg:mx-0 flex flex-col bg-white dark:bg-slate-900 ${!isApprovedUser ? '' : 'justify-between'}`}>
                    <div className={`overflow-y-auto shadow-md h-full ${isApprovedUser ? '' : 'flex items-center justify-center'} `}>
                        <div className={`${isApprovedUser ? 'relative min-h-default-screen bg-[#dce8f5] dark:bg-gray-800' : 'w-full h-full'}`}>
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