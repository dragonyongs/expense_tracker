import React, { useState } from 'react';
import { MdOutlineAttachFile, MdClose, MdAccessTime } from 'react-icons/md';
import { format } from 'date-fns';
import Drawer from 'react-modern-drawer';

const ApprovalList = ({ isEditing, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const data = [
        {
            id: 1,
            date_start: '2024-12-30T09:00:00',
            date_end: '2024-12-30T18:00:00',
            type: '연차',
            name: '홍길동',
            status: '신청',
            reason: '독감으로 인한 연차 사용',
            message: '',
            hasAttachment: true,
            department: '개발팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '홍길봉', status: 'approved' },
                { step: 1, role: '팀원', name: '홍길동', status: 'approved' },
                { step: 2, role: '팀장', name: '김팀장', status: 'pending' },
                { step: 3, role: '본부장', name: '이본부', status: 'pending' },
                { step: 4, role: '대표이사', name: '박대표', status: 'pending' },
            ],
        },
        {
            id: 2,
            date_start: '2024-09-01T09:00:00',
            date_end: '2024-09-01T13:00:00',
            type: '오전반차',
            name: '홍길동',
            status: '진행중',
            reason: '연차 사용',
            message: '',
            hasAttachment: false,
            department: '개발팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '홍길동', status: 'approved' },
                { step: 1, role: '팀원', name: '홍길동', status: 'approved' },
                { step: 2, role: '팀장', name: '김팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '이본부', status: 'pending' },
                { step: 4, role: '대표이사', name: '박대표', status: 'pending' },
            ],
        },
        {
            id: 3,
            date_start: '2024-10-10T09:00:00',
            date_end: '2024-10-10T18:00:00',
            type: '출장',
            name: '이영희',
            status: '반려',
            reason: '업무 출장 요청',
            message: '출장 사유가 불충분합니다.',
            hasAttachment: false,
            department: '영업팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '이영희', status: 'approved' },
                { step: 1, role: '팀원', name: '이영희', status: 'approved' },
                { step: 2, role: '팀장', name: '송팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '김본부', status: 'rejected' },
            ],
        },
        {
            id: 4,
            date_start: '2024-11-15T13:00:00',
            date_end: '2024-11-15T17:00:00',
            type: '오후반차',
            name: '박철수',
            status: '완료',
            reason: '개인 용무',
            message: '',
            hasAttachment: true,
            department: '기획팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '박철수', status: 'approved' },
                { step: 1, role: '팀원', name: '박철수', status: 'approved' },
                { step: 2, role: '팀장', name: '이팀장', status: 'approved' },
                { step: 3, role: '본부장', name: '최본부', status: 'approved' },
            ],
        },
    ];

    const getStatusStyle = (status) => {
        const styles = {
            신청: 'bg-blue-100 text-blue-700 border border-blue-200',
            반려: 'bg-red-100 text-red-700 border border-red-200',
            완료: 'bg-green-100 text-green-700 border border-green-200',
            진행중: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    const formatDuration = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const isSameDay = format(startDate, 'yyyy.MM.dd') === format(endDate, 'yyyy.MM.dd');

        if (isSameDay) {
        return `${format(startDate, 'yyyy.MM.dd')}`;
        }
        return `${format(startDate, 'yyyy.MM.dd HH:mm')} - ${format(endDate, 'yyyy.MM.dd HH:mm')}`;
    };

    const ApprovalStep = ({ step, isActive, isCompleted }) => (
        <div className="flex items-center gap-4 relative">
            {isActive && (
                <div className="absolute w-8 h-8 bg-blue-100 rounded-full animate-pulse-expand"></div>
            )}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
            >
                {step.step}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{step.role}</span>
                <span className="text-xs text-gray-500">{step.name}</span>
            </div>
            {step.status === 'approved' && (
                <div className="absolute -right-2 top-2">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">승인</div>
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b rounded-t-lg">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600">
            <div className="w-24">신청 기간</div>
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
                onClick={() => handleItemClick(item)}
                className="px-3 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
                <div className="flex justify-between items-center">
                <div className="w-24 flex items-center gap-2">
                    <MdAccessTime className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                    {formatDuration(item.date_start, item.date_end)}
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
                    {item.hasAttachment && <MdOutlineAttachFile className="inline-block text-gray-500 h-5 w-5" />}
                </div>
                </div>
            </li>
            ))}
        </ul>

      {/* Drawer Section */}
        <Drawer
            open={isOpen}
            onClose={() => setIsOpen(false)}
            direction="right"
            size={320}
            className="p-6"
        >
        {selectedItem && (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <div>
                        <h5 className="text-xl font-bold">{selectedItem.type} 신청</h5>
                        <p className="text-sm text-gray-500">
                            {formatDuration(selectedItem.date_start, selectedItem.date_end)}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                </div>

                {/* 신청인 정보 */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">신청인</span>
                        <div className="text-right">
                            <div className="font-medium">
                                {selectedItem.name}{' '}
                                <span className="text-sm text-gray-500">{selectedItem.department}</span>
                            </div>
                        </div>
                    </div>

                    {/* 사유 */}
                    {selectedItem.reason && (
                        <>
                            <div className="flex justify-between items-start py-2">
                                <span className="text-gray-600">사유</span>
                                <span className="text-right max-w-[200px]">{selectedItem.reason}</span>
                            </div>
                            <hr className="border-gray-200" />
                        </>
                    )}

                    {/* 현황 */}
                    <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">현황</span>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                                selectedItem.status
                            )}`}
                        >
                            {selectedItem.status}
                        </span>
                    </div>

                    {/* 반려 사유 */}
                    {selectedItem.status === '반려' && selectedItem.message && (
                        <>
                            <div className="flex justify-between items-start py-2">
                                <span className="text-gray-600">반려 사유</span>
                                <span className="text-right max-w-[200px] text-red-600">
                                    {selectedItem.message}
                                </span>
                            </div>
                            <hr className="border-gray-200" />
                        </>
                    )}

                    {/* 첨부파일 */}
                    {selectedItem.hasAttachment && (
                        <>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">첨부파일</span>
                                <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                                    <MdOutlineAttachFile className="h-4 w-4" />
                                    파일보기
                                </button>
                            </div>
                            <hr className="border-gray-200" />
                        </>
                    )}
                </div>

                {/* 결재 프로세스 */}
                <div className="space-y-4">
                    <h6 className="font-medium text-gray-700">결재 프로세스</h6>
                    <div className="space-y-6 relative">
                        <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gray-200"></div>
                        {selectedItem.approvalProcess.map((step, index) => {

                            if (
                                step.role === '신청자' &&
                                selectedItem.approvalProcess[index + 1]?.name === step.name
                            ) {
                                return null;
                            }

                            return (
                            // <React.Fragment key={step.step}>
                                <ApprovalStep
                                    key={step.step}
                                    step={step}
                                    isActive={
                                        step.status === 'pending' &&
                                        index ===
                                            selectedItem.approvalProcess.findIndex(
                                                (s) => s.status === 'pending'
                                            )
                                    }
                                    isCompleted={step.status === 'approved'}
                                />
                            // </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                    {selectedItem.status === '반려' && (
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                            수정하기
                        </button>
                    )}
                    <button
                        className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        닫기
                    </button>
                </div>
            </div>
        )}
    </Drawer>

    </div>
    );  
};

export default ApprovalList;
