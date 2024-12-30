import React, { useState } from 'react';
import { IoChevronDown, IoSearch } from "react-icons/io5";

function SearchInput({ onSearch }) {
    const [searchField, setSearchField] = useState('member_id.member_name');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const handleSearch = () => {
        onSearch(searchField, searchTerm);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="relative flex items-center gap-3 p-2 bg-white dark:bg-slate-700 rounded-xl shadow-lg">
                {/* Custom Select */}
                <div className="relative min-w-[120px]">
                    <button
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between gap-2"
                    >
                        {searchField === 'member_id.member_name' && '이름'}
                        {searchField === 'phones.phone_number' && '전화번호'}
                        {searchField === 'member_id.team_id.team_name' && '팀명'}
                        <IoChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </button>
                    
                    {isSelectOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-800">
                            <div className="py-1">
                                {[
                                    { value: 'member_id.member_name', label: '이름' },
                                    { value: 'phones.phone_number', label: '전화번호' },
                                    { value: 'member_id.team_id.team_name', label: '팀명' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSearchField(option.value);
                                            setIsSelectOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 transition-colors duration-200"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Input */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="검색어를 입력하세요"
                        className="w-full pl-4 pr-10 py-2 text-sm text-gray-900 bg-transparent border-0 focus:ring-0 focus:outline-none"
                    />
                    <button 
                        onClick={handleSearch}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    >
                        <IoSearch className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SearchInput;