import React, { useState } from "react";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import SampleForm from "../form/SampleForm";
// import { Calendar, FileText } from 'lucide-react';
import { IoCalendarClearOutline } from "react-icons/io5";
import { RxFileText } from "react-icons/rx";

const ApprovalApply = ({ onClose, activeTab, setActiveTab, onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [subActiveTab, setSubActiveTab] = useState("vacation");

  // const handleSubmit = (data) => {
  //   console.log('requestData', data);
  // };

  const handleCardClick = (item) => {
    if (item.component) {
      setSelectedComponent(item.component);
      setIsOpen(true);
    } else {
      alert(`${item.name} 항목은 현재 지원되지 않습니다.`);
    }
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedComponent(null);
  };

  // 탭 아이콘 가져오기
  const getTabIcon = (id) => {
    switch (id) {
      case "vacation":
        return <IoCalendarClearOutline className="w-5 h-5" />;
      case "certificate":
        return <RxFileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const categories = [
    {
      id: "vacation",
      title: "내 휴가",
      items: [
        {
          id: "annual",
          name: "연차",
          description: "15일", // 남은 실제 연차 표시
          icon: "☂️",
          component: <SampleForm onClose={handleCloseDrawer} setActiveTab={setActiveTab} formType={"연차"} onSubmit={onSubmit} />,
        },
        {
          id: "replacement",
          name: "대체휴가",
          description: "신청시 지급",
          icon: "🔄",
        },
        {
          id: "holiday",
          name: "휴일포함 휴가",
          description: "신청 시 30일 지급",
          icon: "📅",
        },
        {
          id: "birthday",
          name: "생일 반차",
          description: "매년 4시간 지급",
          icon: "🎂",
        },
        {
          id: "military",
          name: "군소집훈련",
          description: "신청시 지급",
          icon: "⛺",
        },
        {
          id: "sick",
          name: "병가",
          description: "신청시 지급",
          icon: "🏥",
        },
      ],
    },
    {
      id: "certificate",
      title: "증명서",
      items: [
        {
          id: "employment",
          name: "재직증명서",
          description: "재직 증명",
          icon: "📄",
        },
        {
          id: "salary",
          name: "급여증명서",
          description: "급여 증명",
          icon: "💰",
        },
        {
          id: "career",
          name: "경력증명서",
          description: "경력 사항 증명",
          icon: "📋",
        },
        {
          id: "education",
          name: "교육이수증명서",
          description: "교육 이수 증명",
          icon: "🎓",
        },
        {
          id: "income",
          name: "소득증명서",
          description: "근로소득 증명",
          icon: "💵",
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-content-screen">
      <div className="flex gap-1 p-2 bg-white sticky top-0 shadow-sm">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSubActiveTab(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              subActiveTab === category.id
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {getTabIcon(category.id)}
            <span className="font-medium">{category.title}</span>
          </button>
        ))}
      </div>

      <div className="pt-4 pb-20 px-4">
        {categories.map((category) =>
            category.id === subActiveTab && (
              <div key={category.id} className="grid grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                    className="flex flex-col items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.description}
                      </span>
                    </div>
                    {/* <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50"> */}
                    <span className="text-2xl">{item.icon}</span>
                    {/* </div> */}
                  </button>
                ))}
              </div>
            )
        )}
      </div>

      {/* Drawer */}
      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        direction="right"
        size={360}
      >
        {selectedComponent || (
          <p className="text-gray-600">내용을 불러오는 중입니다...</p>
        )}
      </Drawer>
    </div>
  );
};

export default ApprovalApply;
