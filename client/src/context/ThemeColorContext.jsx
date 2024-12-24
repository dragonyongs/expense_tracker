import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/transactions', '/contacts', '/profile', '/teams'];

export const ThemeProvider = ({ children }) => {
    const { isDarkMode } = useDarkMode();
    const location = useLocation(); // location 가져오기
    const [themeColor, setThemeColor] = useState('#ffffff'); // 초기 색상 설정

    useEffect(() => {
        // 현재 경로와 다크 모드 상태에 따라 테마 색상 결정
        const determineThemeColor = () => {
            if (isDarkMode) {
                return (location.pathname === '/' ? '#0433FF' : '#1d293b');
            }
            if (location.pathname === '/') {
                return '#0433FF'; // 루트 경로 색상
            }
            if (specialPaths.includes(location.pathname)) {
                return '#dce8f5'; // 특별 경로 색상
            }
            return '#ffffff'; // 기본 색상
        };

        const newColor = determineThemeColor();
        setThemeColor(newColor);

        // meta 태그 업데이트
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", newColor);
        }
    }, [isDarkMode, location.pathname]); // 다크 모드 및 경로 변경에 반응

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);
