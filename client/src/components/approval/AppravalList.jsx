import React, { useState } from "react";
import { MdCalendarToday } from "react-icons/md";
import {
  formatDateRange,
  formatCreatedAt,
  StatusLabel,
  TypeBadge,
  formatDuration,
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
    setSelectedItem(null); // 선택된 항목 초기화
    setIsOpen(false); // 드로어 닫기
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

  return (
    // max-w-4xl mx-auto
    <div className="overflow-hidden bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="hidden sm:block sticky top-0 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-b">
        <div className="flex justify-between items-center text-sm font-medium text-gray-600 text-center">
          <div className="w-5/12">신청기간</div>
          <div className="w-2/12">구분</div>
          <div className="w-3/12">신청인</div>
          <div className="w-2/12 text-center">현황</div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenDrawer(item)}
            className="group px-4 sm:px-4 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
          >
            {/* Mobile Layout */}
            <div className="sm:hidden space-y-2.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-gray-600">
                  <MdCalendarToday className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {formatDateRange(item.date_start, item.date_end, item.type)}
                  </span>
                </div>
                <StatusLabel status={item.status} />
              </div>
              <div className="flex items-center space-x-3">
                <TypeBadge type={item.type} />
                <div className="flex items-center gap-x-2">
                  <div className="text-md font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-500">{item.department}</div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center">
              <div className="w-5/12">
                <div className="flex items-center gap-2 text-gray-600">
                  <MdCalendarToday className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm">
                    {formatDateRange(item.date_start, item.date_end, item.type)}
                  </span>
                </div>
              </div>

              <div className="w-2/12 flex justify-center">
                <TypeBadge type={item.type} />
              </div>

              <div className="flex flex-col flex-1 items-center">
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">{item.department}</div>
              </div>

              <div className="w-2/12 flex justify-center">
                <StatusLabel status={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
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

// <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
//     {/* Header */}
//     <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b">
//         <div className="flex justify-between items-center text-sm font-medium text-gray-600">
//             <div className="w-28">신청일</div>
//             <div className="w-24">구분</div>
//             <div className="flex-1">신청인</div>
//             <div className="w-16 text-center">현황</div>
//         </div>
//     </div>

//     {/* List */}
//     <div className="divide-y divide-gray-100">
//     {data.map((item) => (
//         <div
//         key={item.id}
//         onClick={() => handleOpenDrawer(item)}
//         className="group px-3 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200"
//         >
//         <div className="flex items-center space-x-2">
//             {/* Date */}
//             <div className="w-28">
//             <div className="flex items-center gap-2 text-gray-600">
//                 <MdCalendarToday className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
//                 <span className="text-sm">
//                 {formatDate(item.createdAt)}
//                 </span>
//             </div>
//             </div>

//             {/* Type */}
//             <div className="w-20">
//             <span className="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
//                 {item.type}
//             </span>
//             </div>

//             {/* User Info */}
//             <div className="flex-1">
//                 <div className="text-sm font-medium text-gray-900">{item.name}</div>
//                 <div className="w-20 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500">{item.department}</div>
//             </div>

//             {/* Status */}
//             <div className="w-16 flex justify-center">
//             <span
//                 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${getStatusStyle(item.status)}`}
//             >
//                 {item.status}
//             </span>
//             </div>
//         </div>
//         </div>
//     ))}
//     </div>
//     <ApprovalDetailDrawer
//         selectedItem={selectedItem}
//         isOpen={isOpen}
//         onClose={handleCloseDrawer}
//         onApprove={handleApprove}
//         onReject={handleReject}
//         onModify={handleModify}
//         isApprover={isApprover}
//         isEditing={isEditing}
//         isLoading={isLoading}
//     />
// </div>
