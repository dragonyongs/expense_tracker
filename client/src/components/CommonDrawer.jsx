import React, { useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';
import { useTheme } from '../context/ThemeColorContext';
import useMediaQuery from '../hooks/useMediaQuery';
import { useDarkMode } from '../context/DarkModeContext';
import { useLocation } from 'react-router-dom';

const CommonDrawer = ({ isOpen, onClose, title, color, darkColor, children, className }) => {
    const { setThemeColor, resetThemeColor, themeColor } = useTheme();
    const { isDarkMode } = useDarkMode();
    const location = useLocation();

    useEffect(() => {
        const targetColor = isOpen
            ? isDarkMode
                ? darkColor || "#1d293b"
                : color
            : location.pathname === "/"
            ? "#0433FF" // 첫 페이지 기본 색상
            : location.pathname === "/contacts" || location.pathname === "/profile"
            ? isDarkMode
                ? "#1e293b"
                : "#dce8f5"
            : "#FFFFFF";

        // 현재 테마 색상이 목표 색상과 다를 때만 상태 업데이트
        if (themeColor !== targetColor) {
            setThemeColor(targetColor);
        }
    }, [isOpen, color, darkColor, isDarkMode, location.pathname, setThemeColor, themeColor]);

    const isMobile = useMediaQuery("(max-width: 640px)");
    const drawerSize = isMobile ? "100%" : "375px";

    const backgroundColor = isDarkMode && darkColor ? darkColor : isDarkMode ? "bg-slate-800" : "";

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
            <div className="dark:bg-slate-800">{children}</div>
        </Drawer>
    );
};

export default CommonDrawer;