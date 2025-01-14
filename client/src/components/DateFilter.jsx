import React, { useState, useEffect } from 'react';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import useMediaQuery from '../hooks/useMediaQuery';
import useViewportHeight from '../hooks/useViewportHeight';
import { DRAWER_STYLES } from '../styles/drawerStyles';
import { MdClose } from 'react-icons/md';
import { LuCheck, LuCalendar } from 'react-icons/lu';
import { IoIosArrowDown } from 'react-icons/io';

function DateFilter({ title, onDateSelect, className}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(``);
    const [dates, setDates] = useState([]);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const viewportHeight = useViewportHeight();
    const styles = DRAWER_STYLES(isMobile, viewportHeight);

    useEffect(() => {
        generateDates();
    }, []);

    const generateDates = () => {
        const currentDate = new Date();
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth() + 1;

        const generatedDates = [];
        for (let i = 0; i < 12; i++) {
            generatedDates.push({ year: String(year), month: String(month).padStart(2, "0") });
            month--;
            if (month === 0) {
                month = 12;
                year--;
            }
        }
        setDates(generatedDates);
    };

    const handleOpenDrawer = () => {
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    const handleDateSelect = (date) => {
        if(date) {
            const formattedDate = `${date.year}년 ${date.month}월`;
            setSelectedDate(formattedDate);
            onDateSelect && onDateSelect(date);
        } else {
            const currentYear = new Date().getFullYear();
            setSelectedDate("전체");
            onDateSelect && onDateSelect({ year: currentYear, month: -1 });
        }
        setIsOpen(false);
    };

    return (
        <>
            <button
                className="group relative flex items-center gap-2 px-3 py-2 mr-1 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200"
                onClick={handleOpenDrawer}
            >
                <LuCalendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className={`${className} min-w-10 inline-block text-ellipsis overflow-hidden text-nowrap font-medium text-gray-700 dark:text-white`}>
                    {selectedDate || "기간 선택"}
                </span>
                <IoIosArrowDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                
                {/* Hover Effect Pulse */}
                <span className="absolute inset-0 rounded-lg bg-blue-100 dark:bg-blue-900/30 opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
            </button>

            <Drawer
                open={isOpen}
                onClose={handleCloseDrawer}
                duration="300"
                direction="bottom"
                className="rounded-tr-2xl rounded-tl-2xl overflow-hidden"
                style={isMobile ? styles.mobile : styles.desktop}
            >
                <div className="px-4 pb-4 bg-white dark:bg-slate-800 dark:text-slate-200">
                    <div className="flex justify-between items-center pt-4">
                        <h5 className="text-lg font-bold flex items-center gap-2">
                            <LuCalendar className="w-5 h-5 text-blue-500 dark:text-blue-600" />
                            {title}
                        </h5>
                        <button 
                            onClick={handleCloseDrawer}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <MdClose className="text-2xl dark:text-slate-300" />
                        </button>
                    </div>
                    <div className="overflow-y-auto h-dateFilter-screen py-4">
                        <ul className="flex flex-col gap-y-2">
                            <li
                            key="all"
                            className={`
                                col-span-2 flex justify-between items-center py-4 px-4 rounded-xl cursor-pointer
                                transition-all duration-200 relative overflow-hidden
                                ${selectedDate === '전체' 
                                ? 'bg-blue-500 dark:bg-blue-800 text-white shadow-lg shadow-blue-500/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600'
                                }
                            `}
                            onClick={() => handleDateSelect(false)}
                            >
                            <div className="flex items-center gap-3">
                                <span className={`text-base font-medium ${selectedDate === '전체' ? 'text-white dark:text-blue-100' : 'text-gray-900 dark:text-slate-400'}`}>
                                전체
                                </span>
                            </div>
                            {selectedDate === '전체' && (
                                <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">선택됨</span>
                                <LuCheck className="w-5 h-5" />
                                </div>
                            )}
                            </li>

                            {dates.map((date) => {
                            const formattedDate = `${date.year}년 ${date.month}월`;
                            const isSelected = selectedDate === formattedDate;
                            return (
                                <li
                                key={`${date.year}-${date.month}`}
                                className={`
                                    flex justify-between items-center py-4 px-4 rounded-xl cursor-pointer
                                    transition-all duration-200 relative overflow-hidden
                                    ${isSelected 
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-gray-600'
                                    }
                                `}
                                onClick={() => handleDateSelect(date)}
                                >
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {date.year}년
                                    </span>
                                    <span className="text-base font-medium">
                                    {date.month}월
                                    </span>
                                </div>
                                {isSelected && (
                                    <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">선택됨</span>
                                    <LuCheck className="w-5 h-5" />
                                    </div>
                                )}
                                </li>
                            );
                            })}
                        </ul>
                    </div>
                </div>
            </Drawer>
        </>
    );
}

export default DateFilter;