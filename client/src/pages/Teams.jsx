import React from 'react'
import axios from "../services/axiosInstance"; 

function Teams() {
    return (
        <>
            {/* <div className='w-full h-default-screen bg-white'>
                <div className='p-6'>Teams</div>
            </div> */}
            <div className='flex flex-col gap-y-2 h-full'>
                <div className='p-8 bg-white shadow-sm'>
                    <h3 className='text-xl mb-3'>팀 운영비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>110,000</span> 원</h2>
                    <div className='flex justify-between mt-10 mb-4'>
                        <span className='text-xl font-bold'>팀 운영비</span>
                        <span className='text-xl text-gray-400'><span className='font-bold text-black'>110,000원</span> 남음</span>
                    </div>
                    <div className='relative'>
                        <div className='absolute top-0 left-0 w-2/4 h-3 bg-blue-500 rounded-full'></div>
                        <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                    </div>
                </div>
                <div className='p-8 bg-white shadow-sm'>
                    <h3 className='text-xl mb-3'>팀장 활동비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>51,000</span> 원</h2>
                    <div className='mt-14'>
                        <div className='flex justify-between mb-4'>
                            <h3 className='flex gap-x-2 items-center'>
                                <span className='text-xl font-bold'>타일러</span>
                                <span className='text-xl '>부장 / 팀장</span>
                            </h3>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>50,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-6/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                </div>
                <div className='p-8 bg-white flex-1'>
                    <h3 className='text-xl mb-3'>팀 활동비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>37,000</span> 원</h2>
                    <div className='mt-14'>
                        <div className='flex justify-between mb-4'>
                            <span className='text-xl font-bold'>토마스</span>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>10,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-11/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                    <div className='mt-12'>
                        <div className='flex justify-between mb-4'>
                            <span className='text-xl font-bold'>크리스티나</span>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>27,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-10/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Teams;