import React, { useEffect, useState } from 'react';

function ProgressBars({ spentPercentage }) { // props를 객체 형태로 받도록 수정
    const [progressWidth, setProgressWidth] = useState(0); // 초기 width를 0으로 설정

    useEffect(() => {
        // spentPercentage가 계산되었을 때 애니메이션 적용
        const timer = setTimeout(() => {
            setProgressWidth(spentPercentage); // 애니메이션 후 spentPercentage로 업데이트
        }, 100);

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 클리어
    }, [spentPercentage]); // spentPercentage가 변경될 때마다 실행

    return (
        <div className='relative'>
            <div 
                className={`absolute top-0 left-0 h-3 transition-all duration-500 ease-in-out rounded-full ${spentPercentage === 100 ? 'bg-green-500' : 'bg-[#0433FF]'}`}
                style={{ width: `${progressWidth}%` }} // 애니메이션을 적용할 width 값
            ></div>
            <div className='w-full h-3 bg-gray-200 rounded-full dark:bg-slate-500'></div>
        </div>
    );
}

export default ProgressBars;
