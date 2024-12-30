import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HeaderWithTabs = ({ tabs }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const currentTab = tabs.find(tab => tab.path === location.pathname);

    return (
        <header className="flex flex-col mb-6 pt-4 px-6 bg-white dark:bg-slate-800 dark:text-slate-200">
            <div className="mb-2 text-2xl">
                <span className="font-semibold">
                    {currentTab ? currentTab.title : 'Unknown Tab'}
                </span>
            </div>
            <div className="flex w-full border-b border-gray-200 dark:border-slate-600">
                {tabs.map(tab => (
                    <button
                        key={tab.path}
                        onClick={() => navigate(tab.path)}
                        className={`flex-1 py-3 text-lg font-medium text-center transition-colors duration-200 ${
                            location.pathname === tab.path
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </header>
    );
};

export default HeaderWithTabs;