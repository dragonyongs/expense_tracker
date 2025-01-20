import React, { useState } from "react";
import { MdCalendarToday, MdAccessTime, MdPerson, MdPeople } from "react-icons/md";
import {
  formatDateRange,
  formatCreatedAt,
  StatusLabel,
  TypeBadge,
} from "../../../utils/approval";
import ApprovalDetailDrawer from "../drawer/ApprovalDetailDrawer";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import SampleForm from '../../../components/approval/form/SampleForm';

const ApprovalList = ({ data, isApprover = false, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenDrawer = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedItem(null);
    setIsOpen(false);
  };

  const sortedData = [...data].sort((a, b) => {
    const createdAtDiff = new Date(b.createdAt) - new Date(a.createdAt);
    if (createdAtDiff !== 0) return createdAtDiff;
    return new Date(b.date_start) - new Date(a.date_start);
  });

  const handleApprove = () => {
    /* 승인 처리 로직 */
  };

  const handleReject = (id, message) => {
      console.log(`Rejected ID: ${id}, Message: ${message}`);
      // 상태 업데이트 또는 API 호출
      const updatedData = data.map((item) =>
          item.id === id ? { ...item, status: '반려', rejectionMessage: message } : item
      );
    console.log('updatedData', updatedData);

      // setData(updatedData); // 필요 시 상태를 업데이트
  };

  const handleModify = (item) => {
    /* 수정 작업 로직 */
    console.log('handleModify-item', item);
  };

  const handleEditCloseDrawer = () => {
    setIsEditing(false);
  }

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
      default:
        // 기본 스타일 반환 (예상치 못한 status 값)
        return {
          container: `${baseStyles} text-gray-600`,
          dot: `${dotStyles} bg-gray-400`,
          border: `${borderStyle} border-gray-300`
        };
    }
  };
  

  return (
    <div className="space-y-4 pt-4 px-4 pb-16">
      {sortedData.map((item) => {
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
                    {`${item.name} ${item.position ? item.position : '테스트'}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MdPeople className="w-4 h-4 text-gray-400" />
                  <span className="text-md text-gray-600">
                    {item.department ? item.department : '테스트팀' }
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
          onApprove={() => handleApprove(selectedItem.id)}
          onReject={(id, message) => handleReject(id, message)} // 메시지와 ID를 받을 수 있도록 설정
          onModify={(item) => handleModify(item)}
          setIsEditing={setIsEditing}
          isApprover={isApprover}
          isLoading={isLoading}
      />

      {/* Drawer */}
      <Drawer
        open={isEditing}
        onClose={handleEditCloseDrawer}
        direction="right"
        size={360}
      >
        {
          <SampleForm
            onClose={handleEditCloseDrawer}
            selectedItem={selectedItem}
          /> || (
            <p className="text-gray-600">내용을 불러오는 중입니다...</p>
        )}
      </Drawer>
    </div>
  );
};

export default ApprovalList;
