import React, { useState, useEffect } from 'react';

import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { FaChevronDown } from "react-icons/fa";

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addListener(listener);
        return () => media.removeListener(listener);
    }, [matches, query]);

    return matches;
};

const ProfileDrawer = ({ isOpen, onClose, title, children }) => {

    const isMobile = useMediaQuery('(max-width: 640px)');
    const drawerSize = isMobile ? '100%' : '574px';
    // const style = {
    //     reactModernDrawer: {
    //         left: '50%',
    //         // transform: 'translateX(-50%)',
    //         width: drawerSize,
    //         height: "90%",
    //         marginLeft: "-50px"
    //     }
    // }

    const mobileStyle = {
        width: '100%',
        height: '90%',
    };
    
    const desktopStyle = {
        left: '50%',
        marginLeft: "-50px",
        width: drawerSize,
        height: '90%',
    };

    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' style={isMobile ? mobileStyle : desktopStyle}>
            <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                    <FaChevronDown />
                </button>
            </div>
            <div className='overflow-y-auto h-profileDrawer-screen dark:bg-slate-800 pb-6 px-6'>
                {children} 
            </div>
        </Drawer>
    )
}

export default ProfileDrawer