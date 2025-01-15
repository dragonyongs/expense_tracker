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
    const [smapleData, setSampleData] = useState( [
        {
            id: 3,
            date_start: "2025-01-22T10:00:00",
            date_end: "2025-01-22T19:00:00",
            type: "연차",
            name: "홍길동",
            position: "팀장",
            status: "진행중",
            reason: "연차 사용",
            message: "",
            department: "퍼블리싱팀",
            approvalProcess: [
                { step: 0, role: "신청자", name: "홍길동", status: "approved" },
                { step: 1, role: "팀장", name: "홍길동", status: "approved" },
                { step: 2, role: "본부장", name: "고길동", status: "pending" },
            ],
            createdAt: "2025-01-16T10:00:03",
        },
        {
            id: 2,
            date_start: "2025-01-15T10:00:00",
            date_end: "2025-01-15T19:00:00",
            type: "연차",
            name: "홍길동",
            position: "팀장",
            status: "완료",
            reason: "연차 사용",
            message: "",
            department: "퍼블리싱팀",
            approvalProcess: [
                { step: 0, role: "신청자", name: "홍길동", status: "approved" },
                { step: 1, role: "팀장", name: "홍길동", status: "approved" },
                { step: 2, role: "본부장", name: "고길동", status: "approved" },
            ],
            createdAt: "2025-01-06T13:10:13",
        },
        {
            id: 1,
            date_start: "2024-12-12T10:00:00",
            date_end: "2024-12-12T19:00:00",
            type: "연차",
            name: "홍길동",
            position: "팀장",
            status: "완료",
            reason: "연차 사용",
            message: "",
            department: "퍼블리싱팀",
            approvalProcess: [
                { step: 0, role: "신청자", name: "홍길동", status: "approved" },
                { step: 1, role: "팀장", name: "홍길동", status: "approved" },
                { step: 2, role: "본부장", name: "이혜숙", status: "approved" },
            ],
            createdAt: "2024-12-10T10:30:33",
        },
    ]);

    useEffect(() => {
        console.log(activeTab);
    }, [activeTab]);

    const handleSubmit = (data) => {
        setSampleData((prevData) => [...prevData, data]);
    };

    const handleUpdateStatus = (id, newStatus, approverName, currentStep, rejectionMessage = "") => {
        setSampleData((prevData) =>
            prevData.map((item) => {
                if (item.id === id) {
                    // approvalProcess 업데이트 로직
                    const updatedApprovalProcess = item.approvalProcess.map((process) =>
                        process.step === currentStep && process.name === approverName
                            ? { ...process, status: newStatus }
                            : process
                    );
    
                    // 모든 단계가 approved인지 확인
                    const isAllApproved = updatedApprovalProcess.every(
                        (p) => p.status === "approved"
                    );
    
                    // 새로운 상태 계산
                    const updatedStatus =
                        newStatus === "rejected"
                            ? "반려"
                            : isAllApproved
                            ? "완료"
                            : "진행중";
    
                    return {
                        ...item,
                        status: updatedStatus,
                        message: newStatus === "rejected" ? rejectionMessage : item.message, // 반려 메시지 반영
                        approvalProcess: updatedApprovalProcess,
                    };
                }
                return item;
            })
        );
    };

    return (
        <>
            <header className={`flex flex-col pt-4 bg-white dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <h1 className="px-6 text-2xl font-medium mb-2">
                    <span className='font-semibold'>결재</span>
                </h1>
                <ApprovalTabs activeTab={activeTab} setActiveTab={setActiveTab} isApprover={isApprover} />
            </header>

            <div className='flex flex-col gap-y-3 pb-4 dark:bg-slate-800'>
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
                                <AppravalList data={smapleData} /> 
                            )}
                            {activeTab === 'approval-pending' && (
                                <AppravalPending data={smapleData} onUpdateStatus={handleUpdateStatus} isApprover={isApprover}/>
                            )}
                            {activeTab === 'approval-apply' && (
                                <AppravalApply onSubmit={handleSubmit} setActiveTab={setActiveTab}/>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-y-3">
                            <LuConstruction className="text-newBlue w-20 h-20"/>
                            <span className="font-semibold text-2xl">페이지 작업중</span>
                        </div>
                    )
                )}
            </div>
        </>
    )
}

export default Index;