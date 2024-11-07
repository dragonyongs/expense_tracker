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
        if (currentHour >= 8 && currentHour < 10) {
            setGreeting('GM!');
        } else if (currentHour === 12) {
            setGreeting('Eat up!');
        } else if (currentHour >= 22) {
            setGreeting('GN!');
        } else {
            setGreeting('Hello,');
        }
    }, []);

    return (
        <header className={`flex justify-between items-center py-4 px-6 shadow-md ${isDashBoard && user.role !== 'super_admin' ? 'bg-[#0433FF] text-white' : 'dark:bg-slate-800 dark:text-slate-200'}`}>
            <div className='text-2xl' >
                <span className='font-thin'>{greeting}</span>
                <span className="pl-2 font-semibold">{user.name.slice(1)}님</span>
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