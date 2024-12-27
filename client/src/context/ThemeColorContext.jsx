import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/contacts', '/profile'];

export const ThemeProvider = ({ children }) => {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [themeColor, setThemeColor] = useState('#ffffff');
    const [isCustomTheme, setIsCustomTheme] = useState(false); // 사용자 정의 여부

    const updateMetaTag = (color) => {
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", color);
        }
    };

    useEffect(() => {
    if (isCustomTheme) return; // 사용자 정의 상태일 경우 기본 로직 실행 안 함

    const determineThemeColor = () => {
        if (location.pathname === '/') {
            return '#0433FF'; // 메인 페이지 색상
        } else if (isDarkMode && specialPaths.includes(location.pathname)) {
            return '#1e293b'; // 다크모드와 specialPaths
        } else if (specialPaths.includes(location.pathname)) {
            return '#dce8f5'; // specialPaths 일반 모드
        } else {
            return '#ffffff'; // 기본 색상
        }
    };

    const newColor = determineThemeColor();
    if (themeColor !== newColor) {
        setThemeColor(newColor);
        updateMetaTag(newColor);
    }
}, [isDarkMode, location.pathname, isCustomTheme]);

    const handleSetThemeColor = (color) => {
        setThemeColor(color);
        setIsCustomTheme(true); // 사용자 정의로 플래그 설정
        updateMetaTag(color);
    };

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor: handleSetThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);