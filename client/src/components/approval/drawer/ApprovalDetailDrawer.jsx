import React, { useState } from 'react';
import { format } from 'date-fns';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import ApprovalProcess from '../common/ApprovalProcess';
import FilePreviewDrawer from '../drawer/FilePreviewDrawer';
import { getFileTypeInfo, formatDuration } from '../../../utils/approval';
import { MdOutlineAttachFile, MdClose } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import RejectionModal from '../../RejectionModal';
import MessageModal from '../../common/MessageModal';

const ApprovalDetailDrawer = ({ selectedItem, isOpen, onClose, onApprove, onReject, onModify, isApprover, setIsEditing, isLoading }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [fileOpen, setFileOpen] = useState(false);
    const [fileDrawerOpen, setFileDrawerOpen] = useState(false);

    const handleFileClick = (file) => {
        setSelectedFile(file);
        setFileDrawerOpen(true);
    };

    const isHalfDay = (selectedItem) => {
        const startDate = new Date(selectedItem.date_start);
        const endDate = new Date(selectedItem.date_end);
        
        // 오전 반차: 09:00 ~ 13:00
        const isMorningHalfDay = startDate.getHours() === 9 && endDate.getHours() === 13;
        // 오후 반차: 14:00 ~ 18:00
        const isAfternoonHalfDay = startDate.getHours() === 14 && endDate.getHours() === 18;
    
        return isMorningHalfDay || isAfternoonHalfDay;
    };

    const handleReject = (message) => {
        onReject(selectedItem.id, message); // 서버와 연동하여 반려 처리
        setIsRejectionModalOpen(false);
    };
    
    const handleApprove = () => {
        onApprove(selectedItem.id); // 서버에 승인 요청
    };

    const handleModify = () => {
        console.log('handleModify-selectedItem', selectedItem);
        onModify(selectedItem);
        setIsEditing(true);
    }

    return (
    <>
        <Drawer
            open={isOpen}
            onClose={onClose}
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
                            {format(new Date(selectedItem.createdAt), 'yyyy.MM.dd HH:mm')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MdClose className="h-6 w-6" />
                    </button>
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
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">기간</span>
                        <span className="text-right max-w-[200px]">{formatDuration(selectedItem.date_start, selectedItem.date_end, isHalfDay(selectedItem))}</span>
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

                    {selectedItem.message.length !== 0 && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600">반려 사유</span>
                        <span className="text-right max-w-[200px]">{selectedItem.message}</span>
                    </div>
                    )}
                </div>

                {/* 첨부파일 */}
                {selectedItem.attachments && selectedItem.attachments.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={()=>setFileOpen(!fileOpen)}>
                            <h6 className="font-medium text-gray-700">첨부파일 <span className="text-sm text-gray-400">{selectedItem.attachments.length}개</span></h6>
                            <IoIosArrowDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${fileOpen ? 'rotate-180' : ''}`} />
                        </div>
                        {fileOpen && <div className="space-y-2">
                            {selectedItem.attachments.map((file) => {

                                const { icon, bgColor, textColor } = getFileTypeInfo(file.type);
                                
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
                        </div>}
                    </div>
                )}

                {/* 결재 프로세스 */}
                <ApprovalProcess selectedItem={selectedItem} />

            </div>
            <div className="space-y-3 p-4">
                {/* 결재권자의 경우 노출, 현재 단계 자신의 승인 단계 일때만 노출 조건 필요 */}
                {isApprover && selectedItem.status === '진행중' && <div className='flex justify-between gap-x-2'> 
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors" onClick={() => setIsRejectionModalOpen(true)}>
                        반려
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors" onClick={handleApprove}>
                        승인
                    </button>
                </div>}

                {/* 신청자와 해당 신청서와 동일인물인 경우에 노출로 관리자는 노출되면 안됨 */}
                {/* 조건: 신청자인 경우, 상태가 반려인 경우만 노출(결재권자X) */}
                {!isApprover && selectedItem.status === '반려' && (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors" onClick={handleModify}>
                        수정하기
                    </button>
                )}
                <button
                    className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
                    onClick={onClose}
                >
                    닫기
                </button>
            </div>
            {/* <RejectionModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onSave={handleReject}
            />  */}
            <MessageModal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                onConfirm={handleReject}
                title="반려 사유"
                description="반려 사유를 입력해주세요."
                confirmText="반려" 
                confirmColor="red"
            />
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
    </>
    );
};

export default ApprovalDetailDrawer;