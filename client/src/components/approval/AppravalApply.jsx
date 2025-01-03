import React, { useState } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import SampleForm from './form/SampleForm';

const ApprovalApply = () => {
    const cardData = [
        { id: 1, icon: '⛱️', title: '연차', description: '15일', component: <SampleForm /> },
        { id: 2, icon: '🎹', title: '대체 휴가', description: '신청시 지급', component: <div>대체 휴가 폼</div> },
        { id: 3, icon: '😀', title: '휴일포함 휴가', description: '신청 시 30일 지급', component: <div>휴일포함 휴가 폼</div> },
        { id: 4, icon: '🎂', title: '생일 반차', description: '매년 4시간 지급', component: <div>생일 반차 폼</div> },
        { id: 5, icon: '🏕️', title: '군소집훈련', description: '신청시 지급', component: <div>군소집훈련 폼</div> },
        { id: 6, icon: '💊', title: '병가', description: '신청시 지급', component: <div>병가 폼</div> },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(null);

    const handleCardClick = (component) => {
        setSelectedComponent(component);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedComponent(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">내 휴가</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardData.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCardClick(card.component)}
                    >
                        <div className="text-3xl">{card.icon}</div>
                        <div>
                            <div className="text-base font-semibold">{card.title}</div>
                            <div className="text-sm text-gray-600">{card.description}</div>
                        </div>
                    </div>
                ))}
            </div>

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