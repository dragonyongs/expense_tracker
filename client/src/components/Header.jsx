import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
// import Notification from './Notification';
import AdminBtn from './AdminBtn';
import Logout from './Logout';
import Darkmode from './DarkMode';

const Header = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [greeting, setGreeting] = useState('');

    const isDashBoard = location.pathname === '/';

    useEffect(() => {
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour < 9) {
            setGreeting('좋은 아침입니다!');
        } else if (currentHour >= 9 && currentHour < 12) {
            setGreeting('좋은 하루 되세요!');
        } else if (currentHour >= 12 && currentHour < 13) {
            setGreeting('맛점하세요!');
        } else if (currentHour >= 13 && currentHour < 18) {
            setGreeting('오후도 힘내세요!');
        } else if (currentHour >= 18 && currentHour < 21) {
            setGreeting('수고하셨습니다!');
        } else if (currentHour >= 21 && currentHour < 24) {
            setGreeting('폰 그만보고, 잘 자요!');
        } else {
            setGreeting('이른 시간이네요~!');
        }
    }, []);

    return (
        <header className={`flex justify-between items-center py-4 px-4 md:px-6 shadow-md ${isDashBoard && user.role !== 'super_admin' ? 'bg-[#0433FF] text-white' : 'dark:bg-slate-800 dark:text-slate-200'}`}>
            <div className='text-xl' >
                <span className="pl-2 font-semibold">{user.name.slice(1)}님</span>
                <span className='font-normal'>, {greeting}</span>
            </div>
            <div className='flex gap-x-4'>
                <Darkmode isDashBoard = {isDashBoard} />
                {/* <Notification isDashBoard = {isDashBoard} role = {user.role} /> */}
                <AdminBtn isDashBoard = {isDashBoard} role = {user.role} />
                <Logout isDashBoard = {isDashBoard} role = {user.role} />
            </div>
        </header>
    );
};

export default Header;


{/*
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import Notification from './Notification';
import AdminBtn from './AdminBtn';
import Logout from './Logout';
import Darkmode from './DarkMode';

const Header = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const isDashBoard = location.pathname === '/';

    return (
        <header className={`flex justify-between items-center py-4 px-6 shadow-md ${isDashBoard && user.role !== 'super_admin' ? 'bg-[#0433FF] text-white' : 'dark:bg-slate-800 dark:text-slate-200'}`}>
            <div className='text-2xl' >
                <span className='font-thin'>Hello,</span>
                <span className="pl-2 font-semibold">{user.name.slice(1)}</span>
            </div>
            <div className='flex gap-x-6'>
                <Darkmode isDashBoard = {isDashBoard} />
                <Notification isDashBoard = {isDashBoard} role = {user.role} />
                <AdminBtn isDashBoard = {isDashBoard} role = {user.role} />
                <Logout isDashBoard = {isDashBoard} role = {user.role} />
            </div>
        </header>
    );
};

export default Header; */}