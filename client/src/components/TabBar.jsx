import { useNavigate } from 'react-router-dom';
import { GoHome } from "react-icons/go";
import { PiPencilSimpleLine } from "react-icons/pi";
import { GoNote } from "react-icons/go";
import { LuFolderLock } from "react-icons/lu";
import { useContext, memo } from 'react';
import { AuthContext } from '../context/AuthProvider';

const TabBarComponent = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    console.log('user', user);

    const handleHome = () => {
        navigate('/');
    };
    const handleAdmin = () => {
        navigate('/admin');
    };
    const handleTransactions = () => {
        navigate('/transactions')
    }

    const allowedRoles = ['admin', 'ms_admin', 'hr_admin'];

    return (
        <nav className='z-50 bg-white shadow-md p-4 flex justify-around'>
            <button type="button" className='flex flex-col items-center' onClick={handleHome}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoHome className="text-2xl" />
                </div>
                <span className="text-sm">홈</span>
            </button>
            <button type="button" className='flex flex-col items-center' onClick={handleTransactions}>
                <div className='flex items-center justify-center w-8 h-8'>
                    <PiPencilSimpleLine className="text-2xl" />
                </div>
                <span className="text-sm">기록</span>
            </button>
            <button type="button" className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-8 h-8'>
                    <GoNote className="text-2xl" />
                </div>
                <span className="text-sm">내역</span>
            </button>
            
            {allowedRoles.includes(user?.role) && (
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
