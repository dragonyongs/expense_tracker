import React, { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import useMediaQuery from '../hooks/useMediaQuery';
import useViewportHeight from '../hooks/useViewportHeight';
import { MdClose } from 'react-icons/md';

const AdminProfileDrawer = ({ isOpen, onClose, title, children }) =>  {
    const isMobile = useMediaQuery('(max-width: 1024px)');
    const viewportHeight = useViewportHeight();

    const drawerSize = isMobile ? '100%' : '576px';

    const mobileStyle = {
        width: '100%',
        height: `${viewportHeight - 50}px`,
    };

    const desktopStyle = {
        left: '50%',
        marginLeft: "-50px",
        width: drawerSize,
        height: 'calc( 100vh - 145px)',
    };

    return (
        <Drawer 
            open={isOpen} 
            onClose={onClose} 
            duration='300' 
            direction='bottom' 
            className="rounded-t-xl overflow-hidden" 
            style={isMobile ? mobileStyle : desktopStyle}
        >
            <div className='flex justify-between items-center w-full h-10 bg-green-600 px-4'>
                <h1 className='font-bold text-white'>{title}</h1>
                <button onClick={onClose}>
                    <MdClose className='text-2xl text-white dark:text-slate-300'/>
                </button>
            </div>

            <div className="p-4">
                {children}
            </div>

        </Drawer>
    );
};

export default AdminProfileDrawer;