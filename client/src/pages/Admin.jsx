import React, { useState } from 'react';

const Admin = () => {
    const [isFlipped, setIsFlipped] = useState(false);

    const toggleCard = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <>
            <div className='p-5 dark:text-white'>관리자 페이지</div>
            <div className='flex justify-center'>
                <div className={`w-72 h-48 perspective`} onClick={toggleCard}>
                    <div className={`bg-slate-900 w-72 h-48 p-4 rounded-lg shadow-lg flex items-end justify-between relative overflow-hidden transition-transform duration-300 ${isFlipped ? 'rotate-y-180' : ''}`} onClick={toggleCard}>
                        {/* 카드 앞면 */}
                        {!isFlipped && (
                            <>
                                {/* IC 칩 */}
                                <div className="w-12 h-10 bg-white rounded-md shadow-md flex items-center justify-center absolute top-12 left-4">
                                    {/* <div className="w-10 h-7 border border-slate-300 rounded-md grid grid-cols-2 gap-1"> */}
                                    <div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                    </div>
                                    <div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                        <div className="w-4 h-4 border border-slate-300 rounded-sm"></div>
                                    </div>
                                    {/* </div> */}
                                </div>

                                {/* 카드 번호 및 사용자 이름 */}
                                <div className="text-white text-lg font-semibold z-10">
                                    <div className="mb-1">0000 0000 0000 0000</div>
                                    <div className="text-sm">사용자 이름</div>
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default Admin;
