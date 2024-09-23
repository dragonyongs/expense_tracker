import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthProvider';

import { MdLogout } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function Logout({isDashBoard, role}) {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/signin');
        } catch (error) {
            console.error('Logout Error: ', error);
        }
    };

    return (
        <div className='relative leading-none'>
            <button className={`text-3xl ${isDashBoard && role !== 'super_admin'  ? 'text-white' : 'text-gray-700 dark:text-slate-400'}`}  onClick={handleLogout}>
                <MdLogout />
            </button>
        </div>
    )
}

export default Logout;