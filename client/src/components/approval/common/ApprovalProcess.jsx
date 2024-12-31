import ApprovalStep from './ApprovalStep';

const ApprovalProcess = ({ selectedItem }) => {
    return (
        <div className="space-y-4">
            <h6 className="font-medium text-gray-700">결재 프로세스</h6>
            <div className="space-y-6 relative">
                <div className="absolute left-4 top-8 bottom-4 w-0.5 bg-gray-100"></div>
                {selectedItem.approvalProcess.map((step, index) => {
                    if (
                        step.role === '신청자' &&
                        selectedItem.approvalProcess[index + 1]?.name === step.name
                    ) {
                        return null;
                    }

                    return (
                        <ApprovalStep
                            key={step.step}
                            step={step}
                            isActive={
                                step.status === 'pending' &&
                                index ===
                                    selectedItem.approvalProcess.findIndex(
                                        (s) => s.status === 'pending'
                                    )
                            }
                            isCompleted={step.status === 'approved'}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ApprovalProcess;
