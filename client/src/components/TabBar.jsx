import { useNavigate, useLocation } from 'react-router-dom';
import { memo } from 'react';
import { GoHome } from "react-icons/go";
import { RxAvatar } from "react-icons/rx";
import { PiStamp, PiAddressBookTabsLight } from "react-icons/pi";
import { GoCreditCard } from "react-icons/go";

const NAVIGATION_ITEMS = [
    {
        path: '/',
        label: '홈',
        icon: GoHome,
        roles: ['ALL']
    },
    {
        path: '/approval',
        label: '신청',
        icon: PiStamp,
        roles: ['member', 'admin']
    },
    {
        path: '/transactions',
        label: '내카드',
        icon: GoCreditCard,
        roles: ['member', 'admin']
    },
    {
        path: '/contacts',
        label: '연락망',
        icon: PiAddressBookTabsLight,
        roles: ['member', 'admin']
    },
    {
        path: '/profile',
        label: '프로필',
        icon: RxAvatar,
        roles: ['member', 'admin']
    }
];

const TabBarComponent = ({ userRole = 'member' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const isSafari = () => {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    const isActiveTab = (path) => {
        if (path === '/admin') {
        return location.pathname.startsWith('/admin');
        }
        return location.pathname === path;
    };

    const NavButton = memo(({ item }) => {
        const Icon = item.icon;
        
        return (
        <button
            type="button"
            className={`flex flex-col items-center transition-all duration-200 group ${
            isActiveTab(item.path)
                ? "text-blue-600 font-semibold dark:text-blue-500"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
        >
            <div className="flex items-center justify-center w-8 h-8 relative">
                {/* {isActiveTab(item.path) && (
                    <div className="absolute -top-2 w-full h-[2px] bg-blue-600 rounded-full" />
                )} */}
                <Icon className="text-2xl transition-transform group-hover:scale-110" />
            </div>
            <span className="text-sm mt-0.5">{item.label}</span>
        </button>
        );
    });
    
    NavButton.displayName = 'NavButton';

    const filteredNavItems = NAVIGATION_ITEMS.filter(item => 
        item.roles.includes('ALL') || item.roles.includes(userRole)
    );

    return (
        <nav 
        className={`z-50 absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md 
        shadow-lg pt-2 px-6 flex justify-between 
        border-t border-slate-100 
        dark:bg-slate-800/80 dark:border-slate-700 
        ${!isSafari() ? "pb-4" : "pb-7"} 
        transition-colors duration-300`}
        >
        {filteredNavItems.map((item) => (
            <NavButton key={item.path} item={item} />
        ))}
        </nav>
    );
};

const TabBar = memo(TabBarComponent);
TabBar.displayName = "TabBar";

export default TabBar;