import React, { useState } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { MdClose } from 'react-icons/md';

// 샘플 요구사항 입력 폼 컴포넌트
const SampleForm = () => {
    return (
        <div className='space-y-6'>
            <div className="flex justify-between items-start">
                <h5 className="text-xl font-bold mt-2">연차 신청서</h5>
                <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <MdClose className="h-6 w-6" />
                </button>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">신청일</label>
                <input
                    type="date"
                    className="mt-1 p-2 border rounded w-full"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">사유</label>
                <textarea
                    className="mt-1 p-2 border rounded w-full"
                    rows="4"
                ></textarea>
            </div>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                신청하기
            </button>
        </div>
    );
};

const ApprovalApply = () => {
    // 가상의 카드 데이터
    const cardData = [
        { id: 1, icon: '⛱️', title: '연차', description: '15일', component: <SampleForm /> },
        { id: 2, icon: '🎹', title: '대체 휴가', description: '신청시 지급', component: <div>대체 휴가 폼</div> },
        { id: 3, icon: '😀', title: '휴일포함 휴가', description: '신청 시 30일 지급', component: <div>휴일포함 휴가 폼</div> },
        { id: 4, icon: '🎂', title: '생일 반차', description: '매년 4시간 지급', component: <div>생일 반차 폼</div> },
        { id: 5, icon: '🏕️', title: '군소집훈련', description: '신청시 지급', component: <div>군소집훈련 폼</div> },
        { id: 6, icon: '💊', title: '병가', description: '신청시 지급', component: <div>병가 폼</div> },
    ];

    // Drawer 상태 관리
    const [isOpen, setIsOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);
    
    // 탭 상태 관리
    const [activeTab, setActiveTab] = useState('휴가 개요');

    // 탭 클릭 핸들러
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(`${tab} 탭이 선택되었습니다.`);
    };

    // 카드 클릭 핸들러
    const handleCardClick = (component) => {
        setSelectedComponent(component);
        setIsOpen(true);
    };

    // Drawer 닫기 핸들러
    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedComponent(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            {/* 상단 타이틀 */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">내 휴가</h1>
            </div>

            {/* 탭 메뉴 */}
            <div className="mb-6 flex gap-x-2">
                {['휴가 개요', '연차 상세', '연차 사용 계획'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`flex-1 py-2 text-center text-sm font-medium rounded-full ${
                            activeTab === tab
                                ? 'text-gray-800 border border-gray-400 font-bold'
                                : 'text-gray-400 hover:text-gray-700 bg-slate-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 카드 컴포넌트 리스트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardData.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCardClick(card.component)}
                    >
                        <div className="text-3xl">{card.icon}</div> {/* 아이콘 */}
                        <div>
                            <div className="text-base font-semibold">{card.title}</div>
                            <div className="text-sm text-gray-600">{card.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Drawer */}
            <Drawer
                open={isOpen}
                onClose={handleCloseDrawer}
                direction="right"
                size={360}
                className="p-4"
            >
                {selectedComponent || <div>내용을 불러오는 중...</div>}
            </Drawer>
        </div>
    );
};

export default ApprovalApply;
