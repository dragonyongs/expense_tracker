import React, { useState, useEffect } from 'react';
import { TbView360Arrow } from "react-icons/tb";

const Admin = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showRotatingIcon, setShowRotatingIcon] = useState(true);
    const [animateFlip, setAnimateFlip] = useState(true); // 애니메이션 제어

    const toggleCard = () => {
        setIsFlipped(!isFlipped);
        setShowRotatingIcon(false); // 클릭 시 아이콘 숨기기
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRotatingIcon(false); // 일정 시간 후 아이콘 숨기기
            setAnimateFlip(false); // 일정 시간 후 애니메이션 비활성화
        }, 3000); // 3초 후에 아이콘 숨김

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className='p-5 dark:text-white'>관리자 페이지</div>
            <div className='flex justify-center'>
                <div className={`w-72 h-48 perspective`} onClick={toggleCard}>
                    <div className={`bg-slate-800 w-72 h-48 p-4 rounded-lg shadow-xl border border-slate-700 flex items-end justify-between relative overflow-hidden transition-transform duration-300 cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}>

                        {/* 카드 앞면 */}
                        {!isFlipped && (
                            <>
                                {/* IC 칩 */}
                                <div className="w-12 h-10 bg-white rounded-md shadow-md flex items-center justify-center absolute top-12 left-4">
                                    <div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                    </div>
                                    <div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                    </div>
                                </div>

                                {/* 카드 번호 및 사용자 이름 */}
                                <div className="text-white text-lg font-semibold z-10">
                                    <div className="mb-1">0000 0000 0000 0000</div>
                                    <div className="text-sm">ADMIN</div>
                                </div>

                                {/* 세로 텍스트 */}
                                <div className="bg-gradient-text bg-clip-text text-gradient text-6xl font-bold -rotate-90 absolute right-0 top-10 transform translate-y-5 translate-x-24">
                                    StarRich
                                </div>
                            </>
                        )}

                        {/* 카드 뒷면 */}
                        {isFlipped && (
                            <div className="absolute inset-0 bg-slate-800 flex flex-col justify-between p-4 text-white">
                                <div className="h-8 bg-gray-700 rounded"></div>
                                <div className='rotate-y-180'>
                                    <div className="text-md">이월: 1,000,000 원</div>
                                    <div className="text-md">잔액: 5,000,000 원</div>
                                </div>
                            </div>
                        )}

                        {/* 회전 아이콘 */}
                        {showRotatingIcon && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`flex items-center justify-center w-20 h-20 bg-slate-950 bg-opacity-40 border border-slate-600 rounded-full transition-transform ${animateFlip ? 'animate-flip-once' : ''}`}>
                                    <TbView360Arrow className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
