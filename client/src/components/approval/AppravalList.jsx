import React, { useState } from "react";
import { MdCalendarToday, MdAccessTime, MdPerson, MdPeople } from "react-icons/md";
import {
  formatDateRange,
  formatCreatedAt,
  StatusLabel,
  TypeBadge,
} from "../../utils/approval";
import ApprovalDetailDrawer from "./drawer/ApprovalDetailDrawer";

const ApprovalList = ({ isEditing, isApprover = false, isLoading }) => {
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

  const handleApprove = () => {
    /* 승인 처리 로직 */
  };
  const handleReject = () => {
    /* 반려 처리 로직 */
  };
  const handleModify = () => {
    /* 수정 작업 로직 */
  };

  const data = [
    {
      id: 2,
      date_start: "2025-01-15T10:00:00",
      date_end: "2025-01-15T19:00:00",
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
        { step: 2, role: "본부장", name: "이혜숙", status: "pending" },
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
      // ... other status cases ...
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

              {/* User Info */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <MdPerson className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {`${item.name} ${item.position}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MdPeople className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
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
        onApprove={() => {}}
        onReject={() => {}}
        onModify={() => {}}
        isApprover={isApprover}
      />
    </div>
  );
};

export default ApprovalList;
