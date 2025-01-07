import React, { useState } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import SampleForm from '../form/SampleForm';

const ApprovalApply = ({ onClose }) => {
  // 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

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
          component: <SampleForm onClose={handleCloseDrawer}/>
        },
        { 
          id: "replacement", 
          name: "대체휴가", 
          description: "신청시 지급",
          icon: "🎹"
        },
        { 
          id: "holiday", 
          name: "휴일포함 휴가", 
          description: "신청 시 30일 지급",
          icon: "😊"
        },
        { 
          id: "birthday", 
          name: "생일 반차", 
          description: "매년 4시간 지급",
          icon: "🎂"
        },
        { 
          id: "military", 
          name: "군소집훈련", 
          description: "신청시 지급",
          icon: "⛺"
        },
        { 
          id: "sick", 
          name: "병가", 
          description: "신청시 지급",
          icon: "💊"
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
          icon: "📄"
        },
        { 
          id: "salary", 
          name: "급여증명서", 
          description: "급여 증명",
          icon: "💰"
        },
        { 
          id: "career", 
          name: "경력증명서", 
          description: "경력 사항 증명",
          icon: "📋"
        },
        { 
          id: "education", 
          name: "교육이수증명서", 
          description: "교육 이수 증명",
          icon: "🎓"
        },
        { 
          id: "income", 
          name: "소득증명서", 
          description: "근로소득 증명",
          icon: "💵"
        }
      ]
    }
  ];

  return (
    <div className="p-6">
      {categories.map((category) => (
        <div key={category.id} className="mb-8">
          {/* 카테고리 제목 */}
          <h2 className="text-2xl font-bold mb-4 dark:text-slate-400">{category.title}</h2>
          
          {/* 카드 리스트 */}
          <div className="grid grid-cols-2 gap-4">
            {category.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer dark:bg-slate-700"
                onClick={() => handleCardClick(item)}
              >
                {/* 아이콘과 텍스트 */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold dark:text-slate-400">{item.name}</h3>
                    <p className="text-gray-600 dark:text-slate-500">{item.description}</p>
                  </div>
                </div>
                {/* 신청하기 버튼 */}
                <button className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 dark:text-slate-500 bg-blue-50 dark:bg-slate-900 rounded-md hover:bg-blue-100 dark:hover:bg-slate-800 transition-colors duration-200">
                  신청하기
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

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