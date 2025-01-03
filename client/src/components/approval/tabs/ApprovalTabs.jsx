// 설명: 탭 컴포넌트. activeTab과 setActiveTab을 props로 받음
const ApprovalTabs = ({ activeTab, setActiveTab, isApprover = false }) => {
    const tabs = [
        { id: 'approval-list', label: '신청 내역' },
        isApprover && { id: 'approval-pending', label: '결재 내역' },
        { id: 'approval-apply', label: '신청 항목' },
    ].filter(Boolean);
    
    return (
        <>
            <div className="flex w-full border-b border-gray-200 dark:border-slate-600">
                {tabs.map((tab, index) => {
                    return ( 
                        <button
                            key={index}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-lg font-medium text-center transition-colors duration-200
                            ${activeTab === tab.id  // activeTab 비교를 tab.id로 수정
                                ? 'text-blue-500 border-b-2 border-blue-600' 
                                : 'text-gray-500'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default ApprovalTabs;
