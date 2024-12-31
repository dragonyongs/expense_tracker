import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeColorContext';
import { useDarkMode } from '../context/DarkModeContext';

const useDrawerTheme = (isOpen) => {
    const { setThemeColor, resetThemeColor } = useTheme();
    const location = useLocation();
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        if (isOpen) {
            const newColor = getDrawerColor(location.pathname, isOpen);
            setThemeColor(newColor);
        } else {
            resetThemeColor();
        }
    }, [isOpen, location.pathname, setThemeColor, resetThemeColor]);

    const getDrawerColor = (pathname, isOpen) => {
        if (pathname === '/') {
            return isOpen ? '#FFFFFF' : '#0433FF';
        } else if (pathname === '/contacts') {
            return isDarkMode ? '#312e80' : isOpen ? '#0433FF' : '#dce8f5';
        } else if (pathname === '/profile') {
            return isDarkMode ? '#121924' : '#59626e';
        } else {
            return isDarkMode ? '#1d293b' : '#FFFFFF';
        }
    };
};

export default useDrawerTheme;
