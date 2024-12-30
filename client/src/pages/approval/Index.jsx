import React, { useState, useEffect, useContext } from 'react'
import { MutatingDots } from 'react-loader-spinner';
import { LuConstruction } from "react-icons/lu";
import AppravalList from '../../components/approval/AppravalList';
// import DateFilter from '../../components/DateFilter';
// import SearchFilter from '../../components/SearchFilter';
// import { MdClose } from 'react-icons/md';

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
                <div className="flex w-full border-b border-gray-200 dark:border-slate-600">
                    <button
                        onClick={() => setActiveTab('approval-list')}
                        className={`flex-1 py-3 text-lg font-medium text-center transition-colors duration-200
                        ${activeTab === 'approval-list' 
                            ? 'text-blue-500 border-b-2 border-blue-600' 
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
            {/* flex flex-col justify-center items-center gap-y-4  */}
                {/* <div className='relative w-full bg-white text-slate-700 dark:text-slate-400 dark:bg-slate-800 rounded-lg shadow-sm min-h-contentWithTab-screen overflow-hidden'> */}
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
                                <div>
                                    {activeTab === 'approval-list' && (
                                        <>
                                            {/* <div className='flex justify-between px-2 mb-2'>
                                                <DateFilter title={'결재 기간 선택'}/>
                                                <SearchFilter placeHolder={'결재 검색'} />
                                            </div> */}
                                            <AppravalList />
                                        </>
                                    )}

                                    {activeTab === 'approval-select' && (
                                        <span className="font-semibold text-2xl">신청 선택</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-y-3">
                                    <LuConstruction className="text-newBlue w-20 h-20"/>
                                    <span className="font-semibold text-2xl">페이지 작업중</span>
                                </div>
                            )
                        )
                    }
                {/* </div> */}
            </div>
        </>
    )
}

export default Index;