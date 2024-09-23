import React from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';

const CommonDrawer = ({ isOpen, onClose, title, children }) => {
    return (
        <Drawer open={isOpen} onClose={onClose} className='h-real-screen' direction='right' size='320px'>
            <div className="flex justify-between py-2 px-4 dark:bg-slate-800">
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={onClose}>
                    <MdClose className='text-2xl dark:text-slate-300'/>
                </button>
            </div>
            <div className='dark:bg-slate-800'>
                {children} 
            </div>
        </Drawer>
    );
};

export default CommonDrawer;
