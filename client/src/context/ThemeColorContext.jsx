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
        // 기본 경로에 따른 색상 계산
        if (location.pathname === '/') {
            return '#0433FF'; // 대시보드 경로
        } else if (specialPaths.includes(location.pathname)) {
            return isDarkMode ? '#1e293b' : '#dce8f5'; // 특별 경로 색상
        } else {
            return '#FFFFFF'; // 기본 색상
        }
    };

    const determineThemeColor = () => {
        return isCustomTheme ? themeColor : getDefaultThemeColor(); // 사용자 정의 상태 유지 또는 기본값 반환
    };

    useEffect(() => {
        if (!isCustomTheme) {
            const newColor = getDefaultThemeColor();

            // 새로운 색상이 기존 색상과 다를 경우만 업데이트
            if (themeColor !== newColor) {
                setThemeColor(newColor);
                updateMetaTag(newColor);
            }
        }
    }, [location.pathname, isDarkMode, isCustomTheme]); // themeColor 의존성 제거

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