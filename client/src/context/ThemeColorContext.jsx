import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDarkMode } from './DarkModeContext';
import { useLocation } from 'react-router-dom';

const ThemeColorContext = createContext();
const specialPaths = ['/contacts', '/profile']; // 특별 경로

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

    const getDefaultThemeColor = () => {
        if (location.pathname === '/') {
            return '#0433FF';
        } else if (specialPaths.includes(location.pathname)) {
            return isDarkMode ? '#1e293b' : '#dce8f5';
        } else {
            return '#FFFFFF';
        }
    };

    useEffect(() => {
        // 사용자 정의 상태가 아니면 기본 경로에 맞는 색상을 설정
        const newColor = isCustomTheme ? themeColor : getDefaultThemeColor();

        // 색상이 변경될 때만 테마 색상 설정
        if (themeColor !== newColor) {
            setThemeColor(newColor);
            updateMetaTag(newColor);
        }
    }, [location.pathname, isDarkMode, isCustomTheme, themeColor]);

    const handleSetThemeColor = (color) => {
        setThemeColor(color);
        setIsCustomTheme(true); // 사용자 정의로 플래그 설정
        updateMetaTag(color);
    };

    const resetThemeColor = () => {
        setIsCustomTheme(false); // 사용자 정의 초기화
        const defaultColor = getDefaultThemeColor();
        setThemeColor(defaultColor); // 초기값으로 설정
        updateMetaTag(defaultColor);
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