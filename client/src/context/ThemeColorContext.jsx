import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';

const ThemeColorContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeColor, setThemeColor] = useState("#0433FF"); // 기본 색상 설정
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", themeColor); // 메타 태그 업데이트
        }

        if( isDarkMode ) {
            setThemeColor('#1d293b');
        } else {
            setThemeColor("#0433FF");
        }

    }, [themeColor, isDarkMode]); // themeColor가 변경될 때마다 실행

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);
