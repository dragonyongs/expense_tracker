import React, { useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';
import useMediaQuery from '../hooks/useMediaQuery';
import useDrawerTheme from '../hooks/useDrawerTheme';

const CommonDrawer = ({ isOpen, onClose, title,  children, className }) => {
    useDrawerTheme(isOpen);

    const isMobile = useMediaQuery("(max-width: 640px)");
    const drawerSize = isMobile ? "100%" : "375px";

    return (
        <Drawer open={isOpen} onClose={onClose} className="h-real-screen" duration="300" direction="right" size={drawerSize}>
            <div
                className={`${className} flex justify-between py-2 px-4 dark:bg-slate-800`}
            >
                <h5 className="text-lg font-bold dark:text-slate-300">{title}</h5>
                <button onClick={onClose}>
                    <MdClose className="text-2xl dark:text-slate-300" />
                </button>
            </div>
            <div className="dark:bg-slate-800">{children}</div>
        </Drawer>
    );
};

export default CommonDrawer;