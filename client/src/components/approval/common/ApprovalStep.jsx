const ApprovalStep = ({ step, isActive, isCompleted }) => {
    return (
        <div className="flex items-center gap-4 relative">
            {isActive && (
                <div className="absolute w-8 h-8 bg-blue-100 rounded-full animate-pulse-expand"></div>
            )}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                        ? 'bg-indigo-100 text-indigo-600'
                        : isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                }`}
            >
                {step.step}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-xs text-gray-500">{step.position}</span>
            </div>
            {step.status === 'approved' && (
                <div className="absolute -right-2 top-2">
                    <div className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">승인</div>
                </div>
            )}
        </div>
    );
};

export default ApprovalStep;