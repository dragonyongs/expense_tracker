import { useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeColorContext';
import { useDarkMode } from '../context/DarkModeContext';

const specialPaths = ['/transactions', '/contacts', '/profile', '/teams'];

const useThemeColor = (location) => {
    const { setThemeColor } = useTheme();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        let newColor;
        if (isDarkMode) {
            newColor = "#1d293b"; // 다크 모드 우선
        } else if (location.pathname === '/') {
            newColor = "#0433FF";
        } else if (specialPaths.includes(location.pathname)) {
            newColor = "#dce8f5";
        } else {
            newColor = "#ffffff";
        }
        setThemeColor(newColor);

        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", newColor);
        }
    }, [location.pathname, isDarkMode, setThemeColor]);
};

export default useThemeColor;
