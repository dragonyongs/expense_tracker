import { useEffect } from 'react';

const themeColors = {
    home: "#0433FF",
    default: "#ffffff",
    special: "#dce8f5",
};

const specialPaths = ['/transactions', '/contacts', '/profile', '/teams'];

const useThemeColor = (location) => {
    useEffect(() => {
        const metaTag = document.querySelector("meta[name='theme-color']");
        if (metaTag) {
            if (location.pathname === '/') {
                metaTag.setAttribute("content", themeColors.home);
            } else if (specialPaths.includes(location.pathname)) {
                metaTag.setAttribute("content", themeColors.special);
            } else {
                metaTag.setAttribute("content", themeColors.default);
            }
        }
    }, [location.pathname]); // 경로가 변경될 때마다 실행
};

export default useThemeColor;