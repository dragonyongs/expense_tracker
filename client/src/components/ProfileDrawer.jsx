import React from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { FaChevronDown } from "react-icons/fa";

const ProfileDrawer = ({ isOpen, onClose, title, children }) => {
    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' size='100%' style={{height: "90%"}}>
            <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                    <FaChevronDown />
                </button>
            </div>
            <div className='overflow-y-auto h-profileDrawer-screen dark:bg-slate-800 px-6'>
                {children} 
            </div>
        </Drawer>
    )
}

export default ProfileDrawer