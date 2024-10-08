import { useNavigate, useLocation } from 'react-router-dom';
import { memo } from 'react';
import { GoHome } from "react-icons/go";
import { PiPencilSimpleLine } from "react-icons/pi";
import { RxAvatar } from "react-icons/rx";
import { PiCardsThree, PiAddressBookTabsLight } from "react-icons/pi";


const TabBarComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // const { user } = useContext(AuthContext);

    const handleHome = () => {
        navigate('/');
    };
    const handleProfile = () => {
        navigate('/profile');
    };
    const handleTeams = () => {
        navigate('/teams');
    };
    const handleTransactions = () => {
        navigate('/transactions');
    };
    const hadleContacts = () => {
        navigate('/contacts');
    };

    // 현재 경로에 따라 탭의 색상을 결정하는 함수
    const isActiveTab = (path) => {
        if (path === '/admin') {
            return location.pathname.startsWith('/admin');
        }
        return location.pathname === path;
    };

    return (
        <nav className='z-50 bg-white shadow-md pt-2 px-6 pb-4 flex justify-between border-t border-slate-100 dark:bg-slate-800 dark:border-slate-700'>
            <button type="button" className={`flex flex-col items-center ${isActiveTab('/') ? 'text-blue-600 font-semibold dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} onClick={handleHome}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoHome className="text-2xl" />
                </div>
                <span className="text-sm">홈</span>
            </button>

            {/* {memberRoles.includes(user?.role) && ( */}
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/teams') ? 'text-blue-600 font-semibold dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} onClick={handleTeams}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiCardsThree className="text-2xl" />
                    </div>
                    <span className="text-sm">팀계좌</span>
                </button>
            {/* )} */}

            {/* {memberRoles.includes(user?.role) && ( */}
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/transactions') ? 'text-blue-600 font-semibold dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} onClick={handleTransactions}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiPencilSimpleLine className="text-2xl" />
                    </div>
                    <span className="text-sm">내카드</span>
                </button>
            {/* )} */}

            {/* {memberRoles.includes(user?.role) && ( */}
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/members') ? 'text-blue-600 font-semibold dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} onClick={hadleContacts}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <PiAddressBookTabsLight className="text-2xl" />
                    </div>
                    <span className="text-sm">연락망</span>
                </button>
            {/* )} */}

            {/* {memberRoles.includes(user?.role) && ( */}
                <button type="button" className={`flex flex-col items-center ${isActiveTab('/profile') ? 'text-blue-600 font-semibold dark:text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} onClick={handleProfile}>
                    <div className='flex items-center justify-center w-8 h-8'>
                        <RxAvatar className="text-2xl" />
                    </div>
                    <span className="text-sm">프로필</span>
                </button>
            {/* )} */}
        </nav>
    );
};

const TabBar = memo(TabBarComponent);

// displayName 설정
TabBar.displayName = "TabBar";

export default TabBar;
