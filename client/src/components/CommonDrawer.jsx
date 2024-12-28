import React, { useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';
import { useTheme } from '../context/ThemeColorContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { useDarkMode } from '../context/DarkModeContext';

const CommonDrawer = ({ isOpen, onClose, title, color, darkColor, children, className }) => {
    const { setThemeColor, resetThemeColor } = useTheme();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        if (isOpen) {
            // Drawer가 열릴 때만 전역 테마 색상 변경
            setThemeColor(isDarkMode ? darkColor || "#1d293b" : color);
        } else {
            // Drawer가 닫힐 때 테마 색상을 초기화
            resetThemeColor();
        }
    }, [isOpen, color, darkColor, isDarkMode, setThemeColor, resetThemeColor]);

    const isMobile = useMediaQuery('(max-width: 640px)');
    const drawerSize = isMobile ? '100%' : '375px';

    const backgroundColor = isDarkMode && darkColor ? darkColor : isDarkMode ? 'bg-slate-800' : '';

    return (
        <Drawer open={isOpen} onClose={onClose} className="h-real-screen" duration="300" direction="right" size={drawerSize}>
            <div
                className={`${className} flex justify-between py-2 px-4 ${backgroundColor}`}
                style={{ backgroundColor: isDarkMode && darkColor ? darkColor : undefined }}
            >
                <h5 className="text-lg font-bold dark:text-slate-200">{title}</h5>
                <button onClick={onClose}>
                    <MdClose className="text-2xl dark:text-slate-300" />
                </button>
            </div>
            <div className="dark:bg-slate-800">
                {children}
            </div>
        </Drawer>
    );
};

export default CommonDrawer;