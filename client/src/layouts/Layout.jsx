import { Outlet } from 'react-router-dom'; //, Navigate, useLocation 
import Header from '../components/Header';
import Tab from '../components/Tab';
import Side from '../components/Side';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

const Layout = () => {
    const { isAuthenticated } = useContext(AuthContext);
    console.log('isAuthenticated', isAuthenticated);
    // const location = useLocation();

    // 로그인 여부를 확인하고 로그인되지 않은 경우 /login으로 리다이렉트
    // if (!isAuthenticated && location.pathname !== '/signin' && location.pathname !== '/signup') {
    //     return <Navigate to="/signin" />;
    // }
    
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
            <div className={`md:max-w-xl mx-auto lg:mx-0 h-screen bg-white flex flex-col ${!isAuthenticated ? 'justify-center' : ''}`}>
                    {isAuthenticated && <Header />}
                    <div className={`${isAuthenticated ? 'flex-grow overflow-y-auto shadow-md' : 'h-full flex items-center justify-center'}`}>
                        <div className={`${isAuthenticated ? 'bg-slate-50 h-[calc(100vh-4rem-5.25rem)] p-4' : 'w-full p-6'}`}>
                            <Outlet />
                        </div>
                    </div>
                    {isAuthenticated && <Tab />}
                </div>
            </section>
        </>
    );
}

export default Layout;
