import React, { useState } from 'react';

const MessageModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = '확인',
    description,
    placeholder = '메시지를 입력하세요...',
    confirmText = '확인',
    cancelText = '취소',
    confirmColor = 'red', // 'red' | 'blue' | 'yellow' 등
}) => {
    const [message, setMessage] = useState('');

    const handleConfirm = () => {
        onConfirm(message);
        setMessage('');
        onClose();
    };

    const handleClose = () => {
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    const colorStyles = {
        red: 'bg-red-600 hover:bg-red-700',
        blue: 'bg-blue-600 hover:bg-blue-700',
        yellow: 'bg-yellow-600 hover:bg-yellow-700',
    };

    const confirmButtonStyle = colorStyles[confirmColor] || colorStyles.red;

    return (
        <div className="fixed inset-0 z-110 flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                onClick={handleClose}
            />
            
            <div className="relative bg-white rounded-lg w-11/12 max-w-md shadow-xl">
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-gray-500">
                                {description}
                            </p>
                        )}
                    </div>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={placeholder}
                        className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!message.trim()}
                            className={`px-4 py-2 text-sm font-medium text-white ${confirmButtonStyle} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;