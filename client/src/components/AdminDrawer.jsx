import React, { useState, useEffect } from 'react';
import CommonDrawer from '../components/CommonDrawer';
import axios from "../services/axiosInstance";
import RadioButton from '../components/RadioButton';
import InputField from '../components/InputField';
import { FaPlus, FaTrashAlt, FaSave } from 'react-icons/fa';

const AdminDrawer = ({ isOpen, onClose, apiUrl, name, onSelect, onSaveComplete }) => {
    const [options, setOptions] = useState([]);
    const [selectedValue, setSelectedValue] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [pendingSaves, setPendingSaves] = useState([]);
    useEffect(() => {
        if (isOpen) {
            axios.get(apiUrl)
                .then(response => setOptions(response.data))
                .catch(err => console.error(err));
        }
    }, [isOpen, apiUrl]);

    useEffect(() => {
        if (!isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);
    
    const handleAdd = () => {
        if (newItemName && newItemDescription) {
            const newOption = {
                // _id: Date.now().toString(),
                [`${name}_name`]: newItemName,
                [`${name}_description`]: newItemDescription,
            };
            setOptions((prev) => [...prev, newOption]);
            setPendingSaves((prev) => [...prev, newOption]);
            setNewItemName('');
            setNewItemDescription('');
            setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiUrl}/${id}`); // 서버로 삭제 요청
            setOptions((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
        }
    };

    const handleSelect = (value) => {
        setSelectedValue(value);
        onSelect(value);
    };

    const handleSave = async () => {
        try {
            await Promise.all(
                pendingSaves.map((item) =>
                    axios.post(apiUrl, {
                        [`${name}_name`]: item[`${name}_name`],
                        [`${name}_description`]: item[`${name}_description`],
                    })
                )
            );
            setPendingSaves([]); // 대기열 비우기
            onSaveComplete(); // 상위 컴포넌트 동기화 호출
            onClose(); // Drawer 닫기
        } catch (error) {
            console.error("저장 중 오류 발생:", error);
        }
    };

    return (
        <CommonDrawer isOpen={isOpen} onClose={onClose} title={`${name} 관리`}>
            <div className="p-6 space-y-6">
                <div className="bg-white shadow-lg rounded-lg">
                    <div className="p-4 max-h-[28rem] overflow-y-auto space-y-3 pr-2">
                        <div className="space-y-3">
                            {options.map((option) => (
                            <div
                            key={option._id}
                            className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleSelect(option._id)}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <input
                                    type="radio"
                                    id={option._id}
                                    name="options"
                                    value={option._id}
                                    checked={selectedValue === option._id}
                                    onChange={() => handleSelect(option._id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                    htmlFor={option._id}
                                    className="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                    {option[`${name}_description`]}
                                </label>
                            </div>
                            {selectedValue === option._id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(option._id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="삭제"
                                >
                                    <FaTrashAlt className="h-4 w-4" />
                                </button>
                            )}
                            </div>
                        ))}
                    </div>
                    </div>
                </div>

                {isAdding ? (
                    <div className="bg-white shadow-lg rounded-lg p-6 space-y-4">
                        <div className="space-y-4">
                            <InputField
                                label="영문 이름"
                                value={newItemName}
                                placeholder="영문 이름 입력"
                                onChange={(e) => setNewItemName(e.target.value)}
                                required
                            />
                            
                            <InputField
                                label="한글 이름"
                                value={newItemDescription}
                                placeholder="한글 이름 입력"
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                            >
                            취소
                            </button>
                            <button
                            onClick={handleAdd}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                            추가
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                        <FaPlus className="inline w-4 h-4 mr-2" />
                        새 항목 추가
                    </button>
                )}

                <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto">
                    <button
                        onClick={handleSave}
                        className="w-full px-4 py-2 text-lg font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-lg"
                    >
                        <FaSave className="inline w-5 h-5 mr-2" />
                        저장하기
                    </button>
                </div>
            </div>

        </CommonDrawer>
    );
};

export default AdminDrawer;
