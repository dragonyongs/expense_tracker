import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/contacts', '/profile'];

export const ThemeProvider = ({ children }) => {
    const { isDarkMode } = useDarkMode();
    const location = useLocation();
    const [themeColor, setThemeColor] = useState('#FFFFFF');
    const [isCustomTheme, setIsCustomTheme] = useState(false); // 사용자 정의 여부

    const updateMetaTag = (color) => {
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            metaTag.setAttribute("content", color);
        }
    };

    const determineThemeColor = () => {
        if (isCustomTheme) return themeColor; // 사용자 정의 상태일 경우 현재 색상 유지

        if (location.pathname === '/') {
            return '#0433FF'; // 메인 페이지 색상
        } else if (specialPaths.includes(location.pathname)) {
            return isDarkMode ? '#1e293b' : '#dce8f5'; // /contacts, /profile 색상
        } else {
            return '#FFFFFF'; // 기본 색상
        }
    };

    useEffect(() => {
        // 사용자 정의 색상이 아닐 때만 테마 색상 변경
        if (!isCustomTheme) {
            const newColor = determineThemeColor();
            if (themeColor !== newColor) {
                setThemeColor(newColor);
                updateMetaTag(newColor);
            }
        }
    }, [isDarkMode, location.pathname, isCustomTheme]);

    const handleSetThemeColor = (color) => {
        setThemeColor(color);
        setIsCustomTheme(true); // 사용자 정의로 플래그 설정
        updateMetaTag(color);
    };

    const resetThemeColor = () => {
        setIsCustomTheme(false); // 사용자 정의 플래그 초기화
    };

    return (
        <ThemeColorContext.Provider
            value={{
                themeColor,
                setThemeColor: handleSetThemeColor,
                resetThemeColor,
            }}
        >
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);