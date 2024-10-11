import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useMediaQuery } from '@mui/material';

const MobileContext = createContext();

export const MobileProvider = ({ children }) => {
    
    const useMediaQuery = (query) => {
        const [matches, setMatches] = useState(false);
    
        useEffect(() => {
            const media = window.matchMedia(query);
            if (media.matches !== matches) {
                setMatches(media.matches);
            }
    
            const listener = () => setMatches(media.matches);
            media.addListener(listener);
            return () => media.removeListener(listener);
        }, [matches, query]);
    
        return matches;
    };

    const isMobile = useMediaQuery('(max-width: 1024px)');

    return (
        <MobileContext.Provider value={isMobile}>
            {children}
        </MobileContext.Provider>
    );
};

export const useMobile = () => {
    return useContext(MobileContext);
};
