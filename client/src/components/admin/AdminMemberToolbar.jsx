import React from 'react';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlineFileUpload, MdOutlineFileDownload } from "react-icons/md";

const AdminMemberToolbar = ({ 
    onAddMember, 
    onUpload, 
    onDownload, 
    categoryCounts, 
    onCategorySelect, 
    selectedCategory 
}) => (
    <div className='flex-1 w-full dark:bg-gray-800'>
        <ul className='flex gap-x-1 mb-6'>
            {['전체', '요청', '퇴사'].map((category) => (
                <li
                    key={category}
                    className={`cursor-pointer px-4 py-1 border rounded-full text-sm ${
                        selectedCategory === category ? 'border-blue-600 text-blue-600 bg-white' : 'border-slate-400 bg-white'
                    }`}
                    onClick={() => onCategorySelect(category)}
                >
                    {category} {category === '요청' && `(${categoryCounts.pending})`}
                    {category === '퇴사' && `(${categoryCounts.resigned})`}
                </li>
            ))}
        </ul>
        <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">회원 목록</h5>
            <div className='flex gap-x-3'>
                <button 
                    className='flex items-center gap-x-1 text-black font-semibold rounded-lg dark:text-white' 
                    onClick={onAddMember}>
                    <IoAddCircleOutline /> 추가
                </button>
                <button 
                    className='flex items-center gap-x-1 text-black font-semibold rounded-lg dark:text-white' 
                    onClick={onUpload}>
                    <MdOutlineFileUpload /> 업로드
                </button>
                <button 
                    className='flex items-center gap-x-1 text-black font-semibold rounded-lg dark:text-white' 
                    onClick={onDownload}>
                    <MdOutlineFileDownload /> 백업
                </button>
            </div>
        </div>
    </div>
);

export default AdminMemberToolbar;
