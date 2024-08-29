import { useNavigate } from 'react-router-dom';
import { useContext, memo } from 'react';
import { AuthContext } from '../context/AuthProvider';

import { GoHome } from "react-icons/go";
import { PiPencilSimpleLine } from "react-icons/pi";
import { LuFolderLock, LuUsers, LuGlobe } from "react-icons/lu";

const TabBarComponent = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleHome = () => {
        navigate('/');
    };
    const handleAdmin = () => {
        navigate('/admin');
    };
    const handleTransactions = () => {
        navigate('/transactions');
    }


    // const adminRoles = ['admin', 'ms_admin', 'hr_admin']; 
    const allowedAdminRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];
    const memberRoles = ['member', 'admin', 'ms_admin', 'hr_admin'];
    // const superAdminRole = ['super_admin'];
    
    return (
        <nav className='z-50 bg-white shadow-md pt-2 px-6 pb-4 flex justify-between'>
            <button type="button" className='flex flex-col items-center' onClick={handleHome}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoHome className="text-2xl" />
                </div>
                <span className="text-sm">홈</span>
            </button>
            
            {memberRoles.includes(user?.role) && (
                <button type="button" className='flex flex-col items-center' onClick={handleTransactions}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiPencilSimpleLine className="text-2xl" />
                    </div>
                    <span className="text-sm">기록</span>
                </button>
            )}

            {allowedAdminRoles.includes(user?.role) && (
                <button type="button" className='flex flex-col items-center'>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <LuGlobe className="text-2xl" />
                    </div>
                    <span className="text-sm">탐색</span>
                </button>
            )}

            <button type="button" className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <LuUsers className="text-2xl" />
                </div>
                <span className="text-sm">회원</span>
            </button>
            
            {allowedAdminRoles.includes(user?.role) && (
                <button type="button" className='flex flex-col items-center' onClick={handleAdmin}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <LuFolderLock className="text-2xl" />
                    </div>
                    <span className="text-sm">관리</span>
                </button>
            )}
        </nav>
    );
};

const TabBar = memo(TabBarComponent);

// displayName 설정
TabBar.displayName = "TabBar";

export default TabBar;
