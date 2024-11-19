import React, { useState } from 'react';

function SearchInput({ onSearch }) {
    const [searchField, setSearchField] = useState('member_id.member_name'); // 기본 검색 필드
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        onSearch(searchField, searchTerm);
    };

    return (
        <div className="flex items-center gap-x-4 mb-4">
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)} className="p-2 border rounded">
                <option value="member_id.member_name">이름</option>
                <option value="phones.phone_number">전화번호</option>
                <option value="member_id.team_id.team_name">팀명</option>
            </select>

            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색어 입력"
                className="p-2 border rounded"
            />
            <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded">검색</button>
        </div>
    );
}

export default SearchInput;