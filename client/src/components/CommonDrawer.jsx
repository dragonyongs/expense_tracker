import React, { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';
import { useTheme } from '../context/ThemeColorContext';
import useMediaQuery from '../hooks/useMediaQuery';

const CommonDrawer = ({ isOpen, onClose, title, color, children, className}) => {
    
    const { setThemeColor } = useTheme();
    
    useEffect(() => {
        if (isOpen) {
            setThemeColor(color);
        } else {
            setThemeColor("#dce8f5");
        }
    }, [isOpen, color, setThemeColor]);

    // 컴포넌트 내부에서 미디어 쿼리 사용
    const isMobile = useMediaQuery('(max-width: 640px)');
    const drawerSize = isMobile ? '100%' : '375px';

    return (
        <Drawer open={isOpen} onClose={onClose} className='h-real-screen' duration="300" direction='right' size={drawerSize}>
            <div className={`${className} flex justify-between py-2 px-4 dark:bg-slate-700`}>
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
