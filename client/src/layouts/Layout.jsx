import { Outlet } from 'react-router-dom';
import Header from '../components/Header'
import Tab from '../components/Tab';
import Side from '../components/Side';

const Layout = () => {
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
                <div className='md:max-w-xl mx-auto lg:mx-0 h-screen bg-white flex flex-col'>
                    <Header />
                    <div className='flex-grow overflow-y-auto shadow-md'>
                        <div className="bg-slate-50 h-[calc(100vh-4rem-5.25rem)] p-4">
                            <Outlet />
                        </div>
                    </div>
                    <Tab />
                </div>
            </section>
        </>
    );
}

export default Layout;