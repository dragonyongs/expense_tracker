import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import Side from '../components/Side';
import { AuthContext } from '../context/AuthProvider';

const Layout = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const isApprovedUser = isAuthenticated && user?.status === 'approved';

    return (
        <>  
            {/* Background */}
            <div className='-z-10 fixed bg-gradient-to-r from-green-50 to-indigo-50 w-full h-full'></div>

            {/* Promotion Message */}
            <div className='hidden z-10 fixed lg:flex items-center lg:h-screen left-desktop'>
                <Side />
            </div>

            {/* Mobile Layout */}
            <section className='lg:ml-mobile'>
                <div className={`h-real-screen md:max-w-xl mx-auto lg:mx-0 bg-white flex flex-col ${!isApprovedUser ? '' : 'justify-center'}`}>
                    {isApprovedUser && <Header />}
                    <div className={`overflow-y-auto shadow-md bg-slate-50 ${isApprovedUser ? '' : 'h-full flex items-center justify-center'}`}>
                        <div className={`min-h-real-screen ${isApprovedUser ? 'relative' : 'w-full p-10'}`}>
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
