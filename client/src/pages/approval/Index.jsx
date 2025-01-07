import React, { useState, useEffect, useContext } from 'react'
import { MutatingDots } from 'react-loader-spinner';
import { LuConstruction } from "react-icons/lu";
import ApprovalTabs from '../../components/approval/tabs/ApprovalTabs';
import AppravalList from '../../components/approval/list/AppravalList';
import AppravalApply from '../../components/approval/list/AppravalApply';
import AppravalPending from '../../components/approval/list/AppravalPending';

function Index() {
    const [activeTab, setActiveTab] = useState('approval-list');
    const [isApprover, setIsApprover] = useState(true);
    const [isPublish, setIsPublish] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    
    return (
        <>
            <header className={`flex flex-col mb-4 pt-4 px-6 bg-white dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <h1 className="text-2xl font-medium mb-2">
                    <span className='font-semibold'>결재</span>
                </h1>
                <ApprovalTabs activeTab={activeTab} setActiveTab={setActiveTab} isApprover={isApprover} />
            </header>
            <div className='flex flex-col gap-y-3 px-3 pb-4 dark:bg-slate-800'>
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
                                    <AppravalList />
                                )}


                                {activeTab === 'approval-pending' && (
                                    <AppravalPending isApprover={isApprover}/>
                                )}

                                {activeTab === 'approval-apply' && (
                                    <AppravalApply />
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
            </div>
        </>
    )
}

export default Index;