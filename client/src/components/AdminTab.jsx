import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const AdminTab = () => {
    const { user } = useContext(AuthContext);

    const tabRef = useRef(null);
    const containerRef = useRef(null);
    const location = useLocation(); // 현재 경로 가져오기
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const allowedRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];

    const tabs = [
        { path: '/admin/members', label: '회원관리', role: ['super_admin', 'admin', 'hr_admin'] },
        { path: '/admin/profiles', label: '프로필관리', role: ['super_admin', 'admin', 'hr_admin'] },
        { path: '/admin/departments', label: '본부관리', role: ['super_admin', 'admin', 'hr_admin'] },
        { path: '/admin/teams', label: '팀관리', role: ['super_admin', 'admin', 'hr_admin'] },
        { path: '/admin/account', label: '계좌관리', role: ['super_admin', 'admin', 'ms_admin'] },
        { path: '/admin/card', label: '카드관리', role: ['super_admin', 'admin', 'ms_admin']},
        { path: '/admin/deposit', label: '입금관리', role: ['super_admin', 'admin', 'ms_admin']},
    ];

    const checkOverflow = () => {
        if (containerRef.current) {
            const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scrollTo = (direction) => {
        if (containerRef.current) {
            const scrollAmount = direction === 'left' ? -200 : 200;
            containerRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const scrollToActiveTab = () => {
        const activeTabElement = tabRef.current?.querySelector('[data-active="true"]');
        if (activeTabElement && containerRef.current) {
            const container = containerRef.current;
            const tabRect = activeTabElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const scrollLeft = container.scrollLeft + tabRect.left - containerRect.left -
                (containerRect.width / 2) + (tabRect.width / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        containerRef.current?.addEventListener('scroll', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
            containerRef.current?.removeEventListener('scroll', checkOverflow);
        };
    }, []);

    useEffect(() => {
        scrollToActiveTab();
    }, [location.pathname]);

    return (
        <div className="relative border-b border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-800">
            {showLeftArrow && (
                <button
                    onClick={() => scrollTo('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                    aria-label="Scroll left"
                >
                    <IoIosArrowBack className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            )}

            {showRightArrow && (
                <button
                    onClick={() => scrollTo('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-slate-700 shadow-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors duration-200"
                    aria-label="Scroll right"
                >
                    <IoIosArrowForward className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            )}

            <div
                ref={containerRef}
                className="overflow-x-auto overflow-y-hidden scrollbar-hide mx-6 no-scrollbar"
            >
                <ul
                    ref={tabRef}
                    className="flex flex-nowrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400"
                >
                    {tabs.map((tab) => (
                        <li
                            key={tab.path}
                            className={`flex-shrink-0 ${tab.role.some(role => allowedRoles.includes(role) && role === user?.role) ? '' : 'hidden'}`}
                        >
                            <Link
                                to={tab.path}
                                data-active={location.pathname === tab.path}
                                className={
                                    `inline-block py-3 px-6 rounded-t-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 ${
                                        location.pathname === tab.path
                                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500 font-semibold'
                                            : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'
                                    }`
                                }
                            >
                                {tab.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminTab;