import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const AdminTab = () => {
    const { user } = useContext(AuthContext);
    const tabRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const location = useLocation();  // 현재 경로 가져오기

    const allowedRoles = ['admin', 'ms_admin', 'hr_admin'];

    const tabs = [
        { path: '/admin/members', label: '회원관리', role: ['admin', 'hr_admin'] },
        { path: '/admin/departments', label: '본부관리', role: ['admin', 'hr_admin'] },
        { path: '/admin/teams', label: '팀관리', role: ['admin', 'hr_admin'] },
        { path: '/admin/account', label: '계좌관리', role: ['admin', 'ms_admin'] },
        { path: '/admin/card', label: '카드관리', role: ['admin', 'ms_admin']},
    ];

    const checkOverflow = () => {
        if (tabRef.current) {
            const isOverflowing = tabRef.current.scrollWidth > tabRef.current.clientWidth;
            setIsOverflowing(isOverflowing);
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, []);

    return (
        <div className="sticky top-0 left-0 text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 bg-white">
            <ul
                ref={tabRef}
                className="flex flex-nowrap -mb-px overflow-x-auto scrollbar-hide"
            >
                {tabs.map((tab) => (
                    <li key={tab.path} className={`me-2 flex-shrink-0 ${tab.role.some(role => allowedRoles.includes(role) && role === user?.role) ? '' : 'hidden'}`}>
                        {tab.disabled ? (
                            <span className={`inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed`}>
                                {tab.label}
                            </span>
                        ) : (
                            <Link
                                to={tab.path}
                                className={`inline-block p-4 border-b-2 rounded-t-lg text-lg ${
                                    location.pathname === tab.path
                                        ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                                }`}
                            >
                                {tab.label}
                            </Link>
                        )}
                    </li>
                ))}

            </ul>
        </div>
    );
};

export default AdminTab;
