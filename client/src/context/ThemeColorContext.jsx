import React, { createContext, useContext, useState } from 'react';

const ThemeColorContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeColor, setThemeColor] = useState("#0433FF"); // 기본 색상 설정

    return (
        <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
            {children}
        </ThemeColorContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeColorContext);
