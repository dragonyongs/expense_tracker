import React, { useState } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import SampleForm from '../form/SampleForm';

const ApprovalApply = ({ onClose }) => {
  // 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [activeTab, setActiveTab] = useState('vacation');

  // 카드 클릭 이벤트 핸들러
  const handleCardClick = (item) => {
    if (item.component) {
      setSelectedComponent(item.component); // 선택된 컴포넌트 설정
      setIsOpen(true); // Drawer 열기
    } else {
      alert(`${item.name} 항목은 현재 지원되지 않습니다.`); // 경고 메시지
    }
  };

  // Drawer 닫기 핸들러
  const handleCloseDrawer = () => {
    setIsOpen(false);
    setSelectedComponent(null);
  };

  // 카테고리 및 카드 데이터
  const categories = [
    {
      id: "vacation",
      title: "내 휴가",
      items: [
        {
          id: "annual",
          name: "연차",
          description: "15일",
          icon: "☂️",
          iconColor: "text-blue-500",
          component: <SampleForm onClose={handleCloseDrawer} />
        },
        {
          id: "replacement",
          name: "대체휴가",
          description: "신청시 지급",
          icon: "🔄",
          iconColor: "text-green-500"
        },
        {
          id: "holiday",
          name: "휴일포함 휴가",
          description: "신청 시 30일 지급",
          icon: "📅",
          iconColor: "text-purple-500"
        },
        {
          id: "birthday",
          name: "생일 반차",
          description: "매년 4시간 지급",
          icon: "🎂",
          iconColor: "text-pink-500"
        },
        {
          id: "military",
          name: "군소집훈련",
          description: "신청시 지급",
          icon: "⛺",
          iconColor: "text-gray-500"
        },
        {
          id: "sick",
          name: "병가",
          description: "신청시 지급",
          icon: "🏥",
          iconColor: "text-red-500"
        }
      ]
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
          iconColor: "text-blue-500"
        },
        {
          id: "salary",
          name: "급여증명서",
          description: "급여 증명",
          icon: "💰",
          iconColor: "text-green-500"
        },
        {
          id: "career",
          name: "경력증명서",
          description: "경력 사항 증명",
          icon: "📋",
          iconColor: "text-purple-500"
        },
        {
          id: "education",
          name: "교육이수증명서",
          description: "교육 이수 증명",
          icon: "🎓",
          iconColor: "text-yellow-500"
        },
        {
          id: "income",
          name: "소득증명서",
          description: "근로소득 증명",
          icon: "💵",
          iconColor: "text-indigo-500"
        }
      ]
    }
  ];

  return (
    <div className="">
        {/* Header */}
        {/* <div className="mb-6">
          <div className="text-2xl font-bold">전자결재</div>
        </div> */}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 pt-4 px-6 border-b bg-white">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`pb-2 ${
                activeTab === category.id
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
        <div className="px-4">
        {/* Cards Grid */}
        {categories.map(
          (category) =>
            category.id === activeTab && (
              <div key={category.id} className="grid grid-cols-2 gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handleCardClick(item)}
                  >
                    <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{item.description}</p>
                    <div className={`text-2xl ${item.iconColor}`}>
                      <span>{item.icon}</span>
                    </div>
                  </div>
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
        className="p-6"
      >
        {selectedComponent || <p className="text-gray-600">내용을 불러오는 중입니다...</p>}
      </Drawer>
    </div>
  );
};

export default ApprovalApply;