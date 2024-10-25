import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeColor, setThemeColor] = useState("#2196F3"); // 기본 색상 설정

    return (
        <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
