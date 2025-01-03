import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MdImage, MdPictureAsPdf, MdFilePresent } from 'react-icons/md';
import React from 'react';

// 요일 매핑
const dayOfWeekMap = {
    Sun: '일',
    Mon: '월',
    Tue: '화',
    Wed: '수',
    Thu: '목',
    Fri: '금',
    Sat: '토',
};

// 공휴일 데이터
const holidays = [
    { date: '2025-01-01', name: '신정' },
    { date: '2025-01-29', name: '설날' },
    { date: '2025-01-30', name: '설날' },
    { date: '2025-01-31', name: '설날' },
    { date: '2025-03-01', name: '삼일절' },
    { date: '2025-05-05', name: '어린이날' },
    { date: '2025-05-15', name: '부처님 오신 날' },
    { date: '2025-06-06', name: '현충일' },
    { date: '2025-08-15', name: '광복절' },
    { date: '2025-09-06', name: '추석' },
    { date: '2025-09-07', name: '추석' },
    { date: '2025-09-08', name: '추석' },
    { date: '2025-10-03', name: '개천절' },
    { date: '2025-10-09', name: '한글날' },
    { date: '2025-12-25', name: '크리스마스' }
];

// 휴일 체크 함수
export const isHoliday = (date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.some(holiday => holiday.date === dateString);
};

// 파일 타입 정보 반환 함수
export const getFileTypeInfo = (fileType) => {
    if (fileType === 'image/jpeg') {
        return {
            icon: <MdImage className="w-5 h-5 text-blue-600" />,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        };
    }
    if (fileType === 'application/pdf') {
        return {
            icon: <MdPictureAsPdf className="w-5 h-5 text-red-600" />,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600'
        };
    }
    return {
        icon: <MdFilePresent className="w-5 h-5" />,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600'
    };
};

// 기간 계산 함수
const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationInHours = (endDate - startDate) / (1000 * 60 * 60);
    return durationInHours > 0 ? `(${durationInHours}시간)` : '';
};

// 기간 포맷팅 함수
export const formatDuration = (start, end, isHalfDay = false) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const isSameDay = format(startDate, 'yyyy.MM.dd') === format(endDate, 'yyyy.MM.dd');
    
    const startDayOfWeek = dayOfWeekMap[format(startDate, 'E')];
    const endDayOfWeek = dayOfWeekMap[format(endDate, 'E')];

    const validDays = eachDayOfInterval({ start: startDate, end: endDate })
        .filter(date => !isHoliday(date));
    
    const dayDifference = validDays.length;

    if (isHalfDay) {
        const startTime = format(startDate, 'HH:mm');
        const endTime = format(endDate, 'HH:mm');
        return `${format(startDate, 'yyyy.MM.dd')} ${startTime} ~ ${endTime} ${calculateDuration(startDate, endDate)}`;
    }

    if (isSameDay) {
        return `${format(startDate, 'yyyy.MM.dd')}(${startDayOfWeek}) (1일간)`;
    }
    
    return `${format(startDate, 'yyyy.MM.dd')}(${startDayOfWeek}) ~ ${format(endDate, 'yyyy.MM.dd')}(${endDayOfWeek}) (${dayDifference}일간)`;
};

// 날짜 범위 포맷팅 함수
export const formatDateRange = (startDate, endDate, type) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (type === '오전반차' || type === '오후반차') {
        return `${format(start, 'yyyy.MM.dd HH:mm', { locale: ko })} ~ ${format(end, 'HH:mm', { locale: ko })}`;
    }
    
    if (isSameDay(start, end)) {
        return format(start, 'yyyy.MM.dd', { locale: ko });
    }
    
    return `${format(start, 'yyyy.MM.dd', { locale: ko })} ~ ${format(end, 'yyyy.MM.dd', { locale: ko })}`;
};

// 생성일 포맷팅 함수
export const formatCreatedAt = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'yyyy.MM.dd', { locale: ko });
};

// StatusLabel 컴포넌트
export const StatusLabel = ({ status }) => {
    const getStatusStyle = (status) => {
        switch (status) {
            case '진행중':
                return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
            case '완료':
                return 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
            case '반려':
                return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
            case '오전반차':
                return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
            case '오후반차':
                return 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20';
            default:
                return 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20';
        }
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusStyle(status)}`}>
            {status}
        </span>
    );
};

// TypeBadge 컴포넌트
export const TypeBadge = ({ type }) => {
    const getTypeStyle = (type) => {
        switch (type) {
            case '연차':
                return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20';
            case '마케팅팀':
                return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20';
            case '인사교육팀':
                return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20';
            case '개발팀':
                return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20';
            case '영업팀':
                return 'bg-pink-50 text-pink-700 ring-1 ring-pink-600/20';
            case '기획팀':
                return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
            default:
                return 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20';
        }
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${getTypeStyle(type)}`}>
            {type}
        </span>
    );
};