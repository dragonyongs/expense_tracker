import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import Notification from './Notification';

const Header = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const isDashBoard = location.pathname === '/';

    return (
        <header className={`flex justify-between items-center py-4 px-6 shadow-md ${isDashBoard ? 'bg-[#0433FF] text-white' : ''}`}>
            <div className='text-2xl' >
                <span className='font-thin'>Hello,</span>
                <span className="pl-2 font-semibold">{user.name.slice(1)}</span>
            </div>
            <Notification isDashBoard = {isDashBoard} />
        </header>
    );
};

export default Header;