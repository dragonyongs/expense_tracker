import React, { useContext} from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider';
import { LuFolderLock } from "react-icons/lu";

const AdminBtn = ({isDashBoard, role}) => {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleAdmin = () => {
        navigate('/admin');
    };

    const allowedAdminRoles = ['super_admin', 'admin', 'ms_admin', 'hr_admin'];
    
    return (
        <>
        {allowedAdminRoles.includes(user?.role) && (

            // <button type="button" className={`flex flex-col items-center text-slate-500 dark:text-slate-400`}>
            <button className={`text-3xl ${isDashBoard && role !== 'super_admin' ? 'text-white' : 'text-gray-700 dark:text-slate-400'}`} onClick={handleAdmin}>

                <div className='flex items-center justify-center w-8 h-8'>
                    <LuFolderLock className="text-3xl" />
                </div>
            </button>
        )}
        </>
    )
}

export default AdminBtn;