import React from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';

const CommonDrawer = ({ isOpen, onClose, title, children }) => {
    return (
        <Drawer open={isOpen} onClose={onClose} className='h-real-screen' direction='right' size='320px'>
            <div className="flex justify-between py-2 px-4">
                <h5 className="text-lg font-bold">{title}</h5>
                <button onClick={onClose}>
                    <MdClose className='text-2xl'/>
                </button>
            </div>
            <div className="p-6">
                {children} 
            </div>
        </Drawer>
    );
};

export default CommonDrawer;
