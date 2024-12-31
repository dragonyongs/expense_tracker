import React, { useState } from 'react';
import { MdCalendarToday, MdOutlineAttachFile } from 'react-icons/md';
import { format } from 'date-fns';
import { getStatusStyle} from '../../utils/approval';
import ApprovalDetailDrawer from './drawer/ApprovalDetailDrawer';

const ApprovalList = ({ isEditing, isApprover, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleOpenDrawer = (item) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedItem(null); // 선택된 항목 초기화
        setIsOpen(false); // 드로어 닫기
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

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
            {/* Header Section */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b rounded-t-lg">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                <div className="w-24">신청일</div>
                <div className="w-20">구분</div>
                <div className="w-14">신청인</div>
                <div className="w-14 text-center">현황</div>
                <div className="w-12 text-center">첨부</div>
                </div>
            </div>

            {/* List Section */}
            <ul className="divide-y divide-gray-100">
                {data.map((item) => (
                <li
                    key={item.id}
                    onClick={() => handleOpenDrawer(item)}
                    className="px-3 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                >
                    <div className="flex justify-between items-center">
                    <div className="w-24 flex items-center gap-2">
                        <MdCalendarToday className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                            {format(new Date(item.createdAt), 'yyyy.MM.dd')}
                        </span>
                    </div>
                    <div className="w-20">
                        <span className="px-2 py-1 text-sm rounded-full border border-gray-200 font-medium">
                        {item.type}
                        </span>
                    </div>
                    <div className="w-14">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.department}</div>
                    </div>
                    <div className="w-14 flex justify-center">
                        <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}
                        >
                        {item.status}
                        </span>
                    </div>
                    <div className="w-12 text-center">
                        {item.attachments && item.attachments.length > 0 && <MdOutlineAttachFile className="inline-block text-gray-500 h-5 w-5" />}
                    </div>
                    </div>
                </li>
                ))}
            </ul>
        
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

export default ApprovalList;
