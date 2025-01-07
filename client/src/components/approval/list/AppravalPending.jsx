import React, { useState } from "react";
import { MdCalendarToday, MdAccessTime, MdPerson, MdPeople } from "react-icons/md";
import {
  formatDateRange,
  formatCreatedAt,
  StatusLabel,
  TypeBadge,
} from "../../../utils/approval";
import ApprovalDetailDrawer from "../drawer/ApprovalDetailDrawer";

const AppravalPending = ({ isEditing, isApprover = false, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleOpenDrawer = (item) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedItem(null);
        setIsOpen(false);
    };

    const handleApprove = () => { /* 승인 처리 로직 */ };
    const handleReject = () => { /* 반려 처리 로직 */ };
    const handleModify = () => { /* 수정 작업 로직 */ };
    const data = [
        {
            id: 5,
            date_start: '2024-12-30T09:00:00',
            date_end: '2025-01-06T18:00:00',
            type: '연차',
            name: '최은진',
            status: '진행중',
            reason: 'A/B형 독감으로 인한 연차 사용',
            message: '',
            department: '마케팅팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '최은진', status: 'approved' },
                { step: 1, role: '팀장', name: '최은진', status: 'approved' },
                { step: 2, role: '본부장', name: '이혜숙', status: 'pending' },
            ],
            attachments: [
                {
                    id: 1,
                    name: '마케팅팀_최은진팀장_병원진단서.pdf',
                    type: 'application/pdf',
                    size: 1024576,
                    uploadedAt: '2024-12-30T10:30:00',
                    url: '/path/to/file.pdf'
                    },
                    {
                    id: 2,
                    name: '마케팅팀_최은진팀장_소견서_증빙사진.jpg',
                    type: 'image/jpeg',
                    size: 2048576,
                    uploadedAt: '2024-12-30T10:31:00',
                    url: 'images/S2023011863613c378148a/d61c1895061a8.png'
                },
            ],
            createdAt: '2024-12-26T15:30:20',
        },
        {
            id: 4,
            date_start: '2024-12-30T09:00:00',
            date_end: '2024-12-30T18:00:00',
            type: '연차',
            name: '남윤주',
            status: '완료',
            reason: '',
            message: '',
            department: '인사교육팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '남윤주', status: 'approved' },
                { step: 1, role: '팀원', name: '남윤주', status: 'approved' },
                { step: 2, role: '팀장', name: '고해연', status: 'approved' },
                { step: 3, role: '본부장', name: '이권석', status: 'approved' },
                { step: 4, role: '대표이사', name: '김광열', status: 'approved' },
            ],
            createdAt: '2024-12-22T12:30:22',
        },
        {
            id: 3,
            date_start: '2024-09-01T09:00:00',
            date_end: '2024-09-01T13:00:00',
            type: '오전반차',
            name: '홍길동',
            status: '진행중',
            reason: '연차 사용',
            message: '',
            department: '개발팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '홍길동', status: 'approved' },
                { step: 1, role: '팀원', name: '홍길동', status: 'approved' },
                { step: 2, role: '팀장', name: '김팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '이본부', status: 'pending' },
                { step: 4, role: '대표이사', name: '김광열', status: 'pending' },
            ],
            createdAt: '2024-08-26T11:20:33',
        },
        {
            id: 2,
            date_start: '2024-10-10T09:00:00',
            date_end: '2024-10-10T18:00:00',
            type: '출장',
            name: '이영희',
            status: '반려',
            reason: '업무 출장 요청',
            message: '출장 사유가 불충분합니다.',
            department: '영업팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '이영희', status: 'approved' },
                { step: 1, role: '팀원', name: '이영희', status: 'approved' },
                { step: 2, role: '팀장', name: '송팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '이혜숙', status: 'rejected' },
            ],
            createdAt: '2024-08-26T11:20:33',
        },
        {
            id: 1,
            date_start: '2024-11-15T14:00:00',
            date_end: '2024-11-15T18:00:00',
            type: '오후반차',
            name: '박철수',
            status: '완료',
            reason: '개인 용무',
            message: '',
            department: '기획팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '박철수', status: 'approved' },
                { step: 1, role: '팀원', name: '박철수', status: 'approved' },
                { step: 2, role: '팀장', name: '이팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '이혜숙', status: 'approved' },
            ],
            createdAt: '2024-08-26T11:20:33',
        },
    ];

    const getStatusStyles = (status) => {
        const baseStyles = "relative flex items-center";
        const dotStyles = "w-2 h-2 rounded-full mr-2";
        const borderStyle = "border-l-4";
        
        switch (status) {
            case '진행중':
                return {
                    container: `${baseStyles} text-blue-600`,
                    dot: `${dotStyles} bg-blue-600 animate-pulse`,
                    border: `${borderStyle} border-blue-500`
                };
            case '완료':
                return {
                    container: `${baseStyles} text-green-600`,
                    dot: `${dotStyles} bg-green-600`,
                    border: `${borderStyle} border-green-500`
                };
            case '반려':
                return {
                    container: `${baseStyles} text-red-600`,
                    dot: `${dotStyles} bg-red-600`,
                    border: `${borderStyle} border-red-500`
                };
            default:
                return {
                    container: `${baseStyles} text-gray-600`,
                    dot: `${dotStyles} bg-gray-600`,
                    border: `${borderStyle} border-gray-500`
                };
        }
    };

    return (
        <div className="space-y-4 p-4">
            {data.map((item) => {
                const statusStyles = getStatusStyles(item.status);
                
                return (
                    <div
                        key={item.id}
                        className={`bg-white rounded-lg ${statusStyles.border} shadow hover:shadow-lg transition-all duration-200 cursor-pointer`}
                        onClick={() => handleOpenDrawer(item)}
                    >
                        <div className="p-4 space-y-3">
                            {/* Status Header */}
                            <div className="flex items-center justify-between">
                                <div className={statusStyles.container}>
                                    <span className={statusStyles.dot}></span>
                                    <span className="text-sm font-medium">
                                        {item.status === '진행중' && item.approvalProcess 
                                            ? `${item.approvalProcess[item.approvalProcess.length - 1].name} ${item.approvalProcess[item.approvalProcess.length - 1].role} 결재중`
                                            : item.status}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatCreatedAt(item.createdAt)} 신청
                                </div>
                            </div>

                            {/* Title & Date */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-x-3">
                                    <div className="text-lg font-medium text-gray-900">
                                        <TypeBadge type={item.type} />
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MdCalendarToday className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">
                                            {formatDateRange(item.date_start, item.date_end, item.type)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-2">
                                    <MdPerson className="w-4 h-4 text-gray-400" />
                                    <span className="text-md text-gray-900">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MdPeople className="w-4 h-4 text-gray-400" />
                                    <span className="text-md text-gray-600">
                                        {item.department}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <ApprovalDetailDrawer
                selectedItem={selectedItem}
                isOpen={isOpen}
                onClose={handleCloseDrawer}
                onApprove={handleApprove}
                onReject={handleReject}
                onModify={handleModify}
                isApprover={isApprover}
                isEditing={isEditing}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AppravalPending;