import React, { useState, useEffect, useContext } from 'react'
import { MutatingDots } from 'react-loader-spinner';
import { LuConstruction } from "react-icons/lu";

function Index() {
    const [activeTab, setActiveTab] = useState('approval-list');
    const [isPublish, setIsPublish] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    
    return (
        <>
            <header className={`flex flex-col mb-6 pt-4 px-6 bg-white dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <h1 className="text-2xl font-medium mb-2">
                    <span className='font-semibold'>결재</span>
                </h1>
                <div className="flex w-full border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('approval-list')}
                        className={`flex-1 py-3 text-lg font-medium text-center transition-colors duration-200
                        ${activeTab === 'approval-list' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500'
                        }`}
                    >
                        리스트
                    </button>
                    <button
                        onClick={() => setActiveTab('approval-select')}
                        className={`flex-1 py-3 text-lg font-medium text-center transition-colors duration-200
                        ${activeTab === 'approval-select' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500'
                        }`}
                    >
                        신청
                    </button>
                </div>
            </header>
            <div className='flex flex-col gap-y-3 px-4 pb-4 dark:bg-slate-800'>
                <div className='relative flex flex-col justify-center items-center gap-y-4 p-6 w-full bg-white rounded-lg shadow-sm min-h-contentWithTab-screen'>
                    {isLoading ? ( 
                        <MutatingDots
                            visible={true}
                            height="100"
                            width="100"
                            color="#b8a57f"
                            secondaryColor="#0433FF"
                            radius="12.5"
                            ariaLabel="mutating-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        ) : (
                            isPublish ? (
                                <div className="p-4">
                                    {activeTab === 'approval-list' && (
                                        <span className="font-semibold text-2xl text-slate-700">결재 리스트</span>
                                    )}

                                    {activeTab === 'approval-select' && (
                                        <span className="font-semibold text-2xl text-slate-700">신청 선택</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-y-3">
                                    <LuConstruction className="text-newBlue w-20 h-20"/>
                                    <span className="font-semibold text-2xl text-slate-700">페이지 작업중</span>
                                </div>
                            )
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default Index;