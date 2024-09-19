import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, memo } from 'react';
import { AuthContext } from '../context/AuthProvider';

import { GoHome } from "react-icons/go";
import { PiPencilSimpleLine } from "react-icons/pi";
import { LuFolderLock } from "react-icons/lu";
import { PiCardsThree, PiAddressBookTabsLight } from "react-icons/pi";


const TabBarComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleHome = () => {
        navigate('/');
    };
    const handleAdmin = () => {
        navigate('/admin/members');
    };
    const handleTeams = () => {
        navigate('/teams');
    };
    const handleTransactions = () => {
        navigate('/transactions');
    };

    // 현재 경로에 따라 탭의 색상을 결정하는 함수
    const isActiveTab = (path) => {
        if (path === '/admin') {
            return location.pathname.startsWith('/admin');
        }
        return location.pathname === path;
    };
    
    // const adminRoles = ['admin', 'ms_admin', 'hr_admin']; 
    const allowedAdminRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];
    const memberRoles = ['member', 'admin', 'ms_admin', 'hr_admin'];
    // const superAdminRole = ['super_admin'];
    

    return (
        <nav className='z-50 bg-white shadow-md pt-2 px-6 pb-4 flex justify-between'>
            <button type="button" className={`flex flex-col items-center ${isActiveTab('/') ? 'text-blue-600 font-semibold' : 'text-slate-500'}`} onClick={handleHome}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoHome className="text-2xl" />
                </div>
                <span className="text-sm">홈</span>
            </button>

            {memberRoles.includes(user?.role) && (
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/teams') ? 'text-blue-600 font-semibold' : 'text-slate-500'}`} onClick={handleTeams}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiCardsThree className="text-2xl" />
                    </div>
                    <span className="text-sm">팀계좌</span>
                </button>
            )}

            {memberRoles.includes(user?.role) && (
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/transactions') ? 'text-blue-600 font-semibold' : 'text-slate-500'}`} onClick={handleTransactions}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiPencilSimpleLine className="text-2xl" />
                    </div>
                    <span className="text-sm">기록</span>
                </button>
            )}

            <button type="button" className={`flex flex-col items-center ${isActiveTab('/members') ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <PiAddressBookTabsLight className="text-2xl" />
                </div>
                <span className="text-sm">연락망</span>
            </button>
    
            {allowedAdminRoles.includes(user?.role) && (
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/admin') ? 'text-blue-600 font-semibold' : 'text-slate-500'}`} onClick={handleAdmin}>
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
