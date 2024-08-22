import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Tab = () => {
    const tabRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

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
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
            <ul
                ref={tabRef}
                className="flex flex-nowrap -mb-px overflow-x-auto scrollbar-hide"
            >
                <li className="me-2 flex-shrink-0">
                    <Link
                        to="/admin/members"
                        className="inline-block p-4 text-blue-600 border-b-2 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500"
                        aria-current="page"
                    >
                        회원관리
                    </Link>
                </li>
                <li className="me-2 flex-shrink-0">
                    <Link
                        to="/admin/departments"
                        className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    >
                        본부관리
                    </Link>
                </li>
                <li className="me-2 flex-shrink-0">
                    <a
                        href="/admin/teams"
                        className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    >
                        부서관리
                    </a>
                </li>
                <li className="me-2 flex-shrink-0">
                    <Link
                        to="/admin/account"
                        className="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                    >
                        계좌관리
                    </Link>
                </li>
                <li className="flex-shrink-0">
                    <Link
                        to="/admin/cards"
                        className="inline-block p-4 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500"
                    >
                        카드관리
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Tab;
