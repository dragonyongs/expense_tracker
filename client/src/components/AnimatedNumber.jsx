import React, { useEffect, useState } from 'react';

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
        if (!isAnimating && value !== displayValue) {
        setIsAnimating(true);
        let start = 0;
        const end = value;
        const duration = 1000; // 1초 동안 애니메이션
        const startTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            
            if (elapsed < duration) {
            // easeOutQuart 이징 함수 사용
            const progress = 1 - Math.pow(1 - elapsed / duration, 4);
            const current = Math.floor(progress * (end - start) + start);
            setDisplayValue(current);
            requestAnimationFrame(animate);
            } else {
            setDisplayValue(end);
            setIsAnimating(false);
            }
        };
        
        requestAnimationFrame(animate);
        }
    }, [value]);

    return displayValue.toLocaleString();
};

export default AnimatedNumber;