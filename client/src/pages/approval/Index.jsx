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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const [smapleData, setSampleData] = useState( [
        {
            id: 3,
            date_start: "2025-01-22T10:00:00",
            date_end: "2025-01-22T19:00:00",
            formType: "연차",
            leaveType: "하루종일",
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
            formType: "연차",
            leaveType: "하루종일",
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
            formType: "연차",
            leaveType: "하루종일",
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

    const handleSubmit = (data) => {
        setSampleData((prevData) => [...prevData, data]);
    };
    
    const handleUpdateStatus = (id, newStatus, approverName, currentStep, rejectionMessage = "") => {
        setSampleData((prevData) =>
            prevData.map((item) => {
                if (item.id === id) {
                    // `approvalProcess` 업데이트 로직
                    const updatedApprovalProcess = item.approvalProcess.map((process) => {
                        if (process.step === currentStep && process.name === approverName) {
                            return { ...process, status: newStatus }; // 현재 단계의 상태 업데이트
                        }
                        if (process.step > currentStep) {
                            return { ...process, status: "pending" }; // 이후 단계는 대기 상태로
                        }
                        return process; // 나머지는 그대로 유지
                    });
    
                    // 상태 판별 로직
                    const isRejected = updatedApprovalProcess.some((p) => p.status === "rejected");
                    const isAllApproved = updatedApprovalProcess.every((p) => p.status === "approved");
    
                    let updatedStatus = item.status;
    
                    if (isRejected) {
                        updatedStatus = "반려";
    
                        // 단계별 반려 처리
                        if (currentStep === 2) {
                            // 본부장이 반려한 경우
                            updatedApprovalProcess[1].status = "pending"; // 팀장은 다시 진행 중으로
                        } else if (currentStep === 1) {
                            // 팀장이 반려한 경우
                            updatedApprovalProcess[0].status = "pending"; // 신청자는 진행 중으로
                        }
                    } else if (isAllApproved) {
                        updatedStatus = "완료";
                    } else {
                        updatedStatus = "진행중";
                    }
    
                    return {
                        ...item,
                        status: updatedStatus,
                        message: isRejected ? rejectionMessage : item.message, // 반려 메시지 업데이트
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