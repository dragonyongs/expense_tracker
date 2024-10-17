import React, { useEffect, useState } from 'react';

function ProgressBars({ spentPercentage, isWarning }) {
    const [progressWidth, setProgressWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgressWidth(spentPercentage);
        }, 100);

        return () => clearTimeout(timer);
    }, [spentPercentage]);

    const progressBarColor = isWarning 
        ? 'bg-red-500'
        : spentPercentage === 100 
            ? 'bg-green-500' 
            : 'bg-[#0433FF]';

    return (
        <div className='relative'>
            <div 
                className={`absolute top-0 left-0 h-3 transition-all duration-500 ease-in-out rounded-full ${progressBarColor}`}
                style={{ width: `${progressWidth}%` }}
            ></div>
            <div className='w-full h-3 bg-gray-200 rounded-full dark:bg-slate-500'></div>
        </div>
    );
}

export default ProgressBars;
