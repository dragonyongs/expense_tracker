import React, { useState, useEffect } from 'react';
import CommonDrawer from '../components/CommonDrawer';
import axios from "../services/axiosInstance";
import RadioButton from '../components/RadioButton';
import InputField from '../components/InputField';

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
            <div className="p-4 space-y-4">
                {options.map((option) => (
                    <div key={option._id} className="flex justify-between items-center">
                        <RadioButton
                            key={option._id}
                            label={option[`${name}_description`]} 
                            value={option._id}
                            checked={selectedValue === option._id}
                            onChange={() => handleSelect(option._id)}
                        />
                        {selectedValue === option._id && (
                            <button
                                onClick={() => handleDelete(option._id)}
                                className="text-red-500 hover:underline"
                            >
                                삭제
                            </button>
                        )}
                    </div>
                ))}
                {isAdding ? (
                    <div className="flex flex-col gap-2 mt-4">
                        <InputField
                            label="영문 이름"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            required
                        />
                        <InputField
                            label="한글 설명"
                            value={newItemDescription}
                            onChange={(e) => setNewItemDescription(e.target.value)}
                            required
                        />
                        <button
                            onClick={handleAdd}
                            className="mt-2 bg-blue-500 text-white p-2 rounded"
                        >
                            추가
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="mt-4 bg-gray-200 text-gray-700 p-2 rounded"
                    >
                        새 항목 추가
                    </button>
                )}
                <button
                    onClick={handleSave}
                    className="mt-4 bg-green-500 text-white p-2 rounded w-full"
                >
                    저장
                </button>
            </div>
        </CommonDrawer>
    );
};

export default AdminDrawer;
