import React, { useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';
import { useTheme } from '../context/ThemeColorContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { useDarkMode } from '../context/DarkModeContext';

const CommonDrawer = ({ isOpen, onClose, title, color, darkColor, children, className }) => {
    const { setThemeColor, resetThemeColor, themeColor } = useTheme();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const targetColor = isDarkMode ? darkColor || "#1d293b" : color;

        if (isOpen) {
            // 드로어가 열릴 때만 색상 변경 (이미 설정된 값과 동일하면 변경하지 않음)
            if (themeColor !== targetColor) {
                setThemeColor(targetColor);
            }
        } else {
            // 드로어가 닫힐 때 테마를 초기화 (경로 기반으로 복원)
            resetThemeColor();
        }
    }, [isOpen, color, darkColor, isDarkMode, setThemeColor, resetThemeColor, themeColor]);

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