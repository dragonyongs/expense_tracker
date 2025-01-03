import React, { useState } from 'react';

const RejectionModal = ({ isOpen, onClose, onSave }) => {
    const [message, setMessage] = useState('');

    const handleSave = () => {
        console.log('Rejection message:', message);
        onSave(message);
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg w-11/12 max-w-md shadow-xl">
                <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            반려 사유
                        </h3>
                        {/* <p className="text-sm text-gray-500">
                            반려 사유를 입력해주세요.
                        </p> */}
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="반려 사유를 입력하세요..."
                        className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!message.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            반려
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;