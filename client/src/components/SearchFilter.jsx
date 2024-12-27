import React, { useState, useRef, useEffect } from 'react';
import { IoSearch, IoClose } from "react-icons/io5";
import { IoMdClose} from "react-icons/io";

function SearchFilter({ onSearchStateChange, onSearchTermChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        onSearchStateChange?.(isOpen);
    }, [isOpen]);

    const handleToggleSearch = () => {
        setIsOpen(!isOpen);
    };

    const handleSearch = () => {
        console.log('검색어:', searchText);
        onSearchTermChange(searchText); // 부모 컴포넌트에 검색어 전달
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
            handleToggleSearch();
            setSearchText('');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setSearchText('');
    };

    return (
        <div ref={containerRef} className="relative flex items-center justify-end">
            <div
                className={`
                    flex items-center
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-full md:w-80' : 'w-10'}
                `}
            >
                <div className={`
                    flex-1
                    transition-all duration-300
                    ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}
                `}>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="거래내역 검색..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="
                            w-full h-10
                            bg-gray-100 dark:bg-slate-700
                            rounded-lg px-3
                            outline-none
                            text-gray-700 dark:text-white
                            placeholder-gray-400
                            dark:placeholder-gray-300
                        "
                    />
                </div>

                <button
                    type="button"
                    onClick={handleToggleSearch}
                    className={`
                        flex-shrink-0
                        flex items-center justify-center
                        w-10 h-10 rounded-lg
                        transition-colors duration-200
                        text-gray-500 hover:text-gray-700
                        dark:text-white dark:hover:text-gray-200
                    `}
                >
                    {isOpen ? <IoClose className="text-2xl" /> : <IoSearch className="text-2xl" />}
                </button>

                
            </div>

            {isOpen && searchText && (
                <button
                    onClick={handleClose}
                    className="
                        absolute right-0 top-1/2 -translate-y-1/2
                        w-10 h-10
                        flex items-center justify-center
                        text-gray-400 hover:text-gray-600
                        dark:text-gray-300 dark:hover:text-white
                    "
                >
                    <IoMdClose className="text-xl" />
                </button>
            )}
        </div>
    );
}

export default SearchFilter;