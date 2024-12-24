import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/transactions', '/contacts', '/profile', '/teams'];

export const ThemeProvider = ({ children }) => {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [themeColor, setThemeColor] = useState('#ffffff');

    useEffect(() => {
        const determineThemeColor = () => {
            if (isDarkMode) {
                return location.pathname === '/' ? '#0433FF' : '#1d293b';
            } else {
                if (location.pathname === '/') return '#0433FF';
                if (specialPaths.includes(location.pathname)) return '#dce8f5';
                return '#ffffff';
            }
        };

        const newColor = determineThemeColor();
        if (themeColor !== newColor) {
            setThemeColor(newColor);

            // meta 태그 업데이트
            const metaTag = document.querySelector("meta[name='theme-color']");
            if (metaTag) {
                metaTag.setAttribute("content", newColor);
            }
        }
    }, [isDarkMode, location.pathname]); 

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);
