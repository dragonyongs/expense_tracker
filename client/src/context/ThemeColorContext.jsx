import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/transactions', '/contacts', '/profile', '/teams'];

export const ThemeProvider = ({ children }) => {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [themeColor, setThemeColor] = useState('#ffffff');

    const updateMetaTag = (color) => {
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", color);
        }
    };

    useEffect(() => {
        const determineThemeColor = () => {
            if (isDarkMode && specialPaths.includes(location.pathname)) {
                return '#1e293b';
            } else {
                if (location.pathname === '/') return '#0433FF';
                if (specialPaths.includes(location.pathname)) return '#dce8f5';
                return '#ffffff';
            }
        };

        const newColor = determineThemeColor();
        if (themeColor !== newColor) {
            setThemeColor(newColor);
            updateMetaTag(newColor); 

            const metaTag = document.querySelector("meta[name='theme-color']");
            if (metaTag) {
                metaTag.setAttribute("content", newColor);
            }
        }
    }, [isDarkMode, location.pathname], themeColor); 

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);
