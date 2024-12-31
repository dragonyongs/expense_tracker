import React, { useState } from 'react';
import { MdCalendarToday, MdOutlineAttachFile, MdClose, MdAccessTime, MdImage, MdPictureAsPdf, MdFilePresent } from 'react-icons/md';
import { format } from 'date-fns';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';

const getFileTypeInfo = (fileType) => {

    if (fileType ==='image/jpeg') {
        return {
        icon: <MdImage className="w-5 h-5 text-blue-600" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
        };
    }
    if (fileType === 'application/pdf') {
        return {
        icon: <MdPictureAsPdf className="w-5 h-5 text-red-600" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600'
        };
    }
    return {
        icon: <MdFilePresent className="w-5 h-5" />,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600'
    };
};

const FilePreviewDrawer = ({ file, isOpen, onClose }) => {
    if (!file) return null;

    const { icon, bgColor, textColor } = getFileTypeInfo(file.type);

    return (
        <Drawer
        open={isOpen}
        onClose={onClose}
        direction="right"
        size={320}
        className="p-6"
        >
        <div className="space-y-6">
            <div className="flex justify-between items-center">
            <h5 className="text-xl font-bold">파일 상세</h5>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <MdClose className="h-6 w-6" />
            </button>
            </div>

            <div className={`p-4 ${bgColor} rounded-lg`}>
            <div className="flex items-center gap-3">
                {icon}
                <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{format(new Date(file.uploadedAt), 'yyyy.MM.dd HH:mm')}</p>
                </div>
            </div>
            </div>

            {file.type.startsWith('image/') ? (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-contain"
                />
            </div>
            ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">미리보기를 지원하지 않는 파일 형식입니다.</p>
            </div>
            )}

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
            다운로드
            </button>
        </div>
        </Drawer>
    );
};

const ApprovalList = ({ isEditing, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDrawerOpen, setFileDrawerOpen] = useState(false);

    const handleFileClick = (file) => {
        setSelectedFile(file);
        setFileDrawerOpen(true);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const data = [
        {
            id: 5,
            date_start: '2024-12-30T09:00:00',
            date_end: '2024-12-30T18:00:00',
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
        },
        {
            id: 4,
            date_start: '2024-12-30T09:00:00',
            date_end: '2024-12-30T18:00:00',
            type: '연차',
            name: '홍길동',
            status: '진행중',
            reason: '독감으로 인한 연차 사용',
            message: '',
            department: '개발팀',
            approvalProcess: [
                { step: 0, role: '신청자', name: '임꺽정', status: 'approved' },
                { step: 1, role: '팀원', name: '홍길동', status: 'approved' },
                { step: 2, role: '팀장', name: '김팀장', status: 'pending' },
                { step: 3, role: '본부장', name: '이본부', status: 'pending' },
                { step: 4, role: '대표이사', name: '김광열', status: 'pending' },
            ],
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
        },
        {
            id: 1,
            date_start: '2024-11-15T13:00:00',
            date_end: '2024-11-15T17:00:00',
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
                        ? 'bg-indigo-100 text-indigo-600'
                        : isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                }`}
            >
                {step.step}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-xs text-gray-500">{step.role}</span>
            </div>
            {step.status === 'approved' && (
                <div className="absolute -right-2 top-2">
                    <div className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">승인</div>
                </div>
            )}
        </div>
    );

    const ApprovalProcess = ({ selectedItem }) => {
        return (
            <div className="space-y-4">
                <h6 className="font-medium text-gray-700">결재 프로세스</h6>
                <div className="space-y-6 relative">
                    <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gray-100"></div>
                    {selectedItem.approvalProcess.map((step, index) => {
                        if (
                            step.role === '신청자' &&
                            selectedItem.approvalProcess[index + 1]?.name === step.name
                        ) {
                            return null;
                        }
    
                        return (
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
                        );
                    })}
                </div>
            </div>
        );
    };

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
                onClick={() => handleItemClick(item)}
                className="px-3 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
                <div className="flex justify-between items-center">
                <div className="w-24 flex items-center gap-2">
                    <MdCalendarToday className="text-gray-400" />
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
                    {item.attachments && item.attachments.length > 0 && <MdOutlineAttachFile className="inline-block text-gray-500 h-5 w-5" />}
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
            size={360}
        >
        {selectedItem && (
            <>
            <div className="p-6 overflow-y-auto h-FullDrawer-screen space-y-6">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                            selectedItem.type === '연차' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                            {selectedItem.type}
                        </span>
                        <h5 className="text-xl font-bold mt-2">신청서</h5>
                        <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(selectedItem.date_start), 'yyyy.MM.dd HH:mm')}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
                    {/* <div>
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
                    </button> */}
                </div>

                {/* 신청인 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">신청인</span>
                        <div className="text-right">
                        <div className="font-medium">
                            <span className="text-sm text-gray-500 pr-2">{selectedItem.department}</span>
                            {selectedItem.name}
                        </div>
                        </div>
                    </div>

                    {selectedItem.reason && (
                        <div className="flex justify-between items-start">
                        <span className="text-gray-600">사유</span>
                        <span className="text-right max-w-[200px]">{selectedItem.reason}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">현황</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedItem.status === '진행중' ? 'bg-blue-50 text-blue-600' :
                            selectedItem.status === '반려' ? 'bg-red-50 text-red-600' :
                            'bg-green-50 text-green-600'
                            }`}>
                            {selectedItem.status}
                        </span>
                    </div>
                </div>

                {/* 첨부파일 */}
                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                    <div className="space-y-4">
                        <h6 className="font-medium text-gray-700">첨부파일</h6>
                        <div className="space-y-2">
                            {selectedItem.attachments.map((file) => {

                                const { icon, bgColor, textColor } = getFileTypeInfo(file.type);
                                console.log('textColor: ', textColor);
                                
                                return (
                                    <button
                                        key={file.id}
                                        onClick={() => handleFileClick(file)}
                                        className={`w-full p-3 ${bgColor} rounded-lg hover:opacity-80 transition-opacity`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {icon}
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className={`font-medium truncate ${textColor}`}>
                                                    {file.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(file.size / 1024 / 1024).toFixed(1)}MB
                                                </p>
                                            </div>
                                            <MdOutlineAttachFile className={`w-5 h-5 ${textColor}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 결재 프로세스 */}
                <ApprovalProcess selectedItem={selectedItem} />

            </div>
            <div className="space-y-3 p-4">
                <div className='flex justify-between gap-x-2'>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors">
                        반려
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                        승인
                    </button>
                </div>
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
            </>
        )}
        </Drawer>
        <FilePreviewDrawer
            file={selectedFile}
            isOpen={fileDrawerOpen}
            onClose={() => {
            setFileDrawerOpen(false);
            setSelectedFile(null);
            }}
        />
    </div>
    );  
};

export default ApprovalList;
