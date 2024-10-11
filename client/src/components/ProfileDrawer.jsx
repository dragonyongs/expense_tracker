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

    const isMobile = useMediaQuery('(max-width: 1024px)');
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    
    useEffect(() => {
        const handleResize = () => setViewportHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        
        // Cleanup on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const drawerSize = isMobile ? '100%' : '576px';

    const mobileStyle = {
        width: '100%',
        height: `${viewportHeight - 50}px`,  // Use dynamically calculated height
    };

    const desktopStyle = {
        left: '50%',
        marginLeft: "-50px",
        width: drawerSize,
        height: 'calc( 100vh - 145px)',
    };

    return (
        <Drawer open={isOpen} onClose={onClose} duration='300' direction='bottom' className="rounded-tr-lg rounded-tl-lg" style={isMobile ? mobileStyle : desktopStyle}>
                <div className="flex justify-between py-4 px-6 dark:bg-slate-800">
                    <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                    <button onClick={onClose} className='text-2xl dark:text-slate-300 mb-4'>
                        <FaChevronDown />
                    </button>
                </div>
                <div className='dark:bg-slate-800'>
                    {/* <div className={`overflow-y-auto pb-6 px-6 ${isMobile ? 'h-profileDrawerMobilel-screen' : 'h-profileDrawer-screen'}`}> */}
                        {children} 
                    {/* </div> */}
                </div>
        </Drawer>
    )
}

export default ProfileDrawer