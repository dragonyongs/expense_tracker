import React, { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';

// useMediaQuery 훅 정의
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

const CommonDrawer = ({ isOpen, onClose, title, children }) => {
    // 컴포넌트 내부에서 미디어 쿼리 사용
    const isMobile = useMediaQuery('(max-width: 640px)');
    const drawerSize = isMobile ? '100%' : '375px';

    return (
        <Drawer open={isOpen} onClose={onClose} className='h-real-screen' duration="300" direction='right' size={drawerSize}>
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
