import { format, eachDayOfInterval } from 'date-fns'; //differenceInDays
import { MdImage, MdPictureAsPdf, MdFilePresent } from 'react-icons/md';
const dayOfWeekMap = {
    Sun: '일',
    Mon: '월',
    Tue: '화',
    Wed: '수',
    Thu: '목',
    Fri: '금',
    Sat: '토',
};

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

const isHoliday = (date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    const dateString = format(date, 'yyyy-MM-dd');
    return holidays.some(holiday => holiday.date === dateString);
};

export const getFileTypeInfo = (fileType) => {

    if (fileType ==='image/jpeg') {
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

export const getStatusStyle = (status) => {
    const styles = {
        신청: 'bg-blue-100 text-blue-700 border border-blue-200',
        반려: 'bg-red-100 text-red-700 border border-red-200',
        완료: 'bg-green-100 text-green-700 border border-green-200',
        진행중: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationInHours = (endDate - startDate) / (1000 * 60 * 60); // 시간 단위로 변환
    return durationInHours > 0 ? `(${durationInHours}시간)` : '';
};

export const formatDuration = (start, end, isHalfDay = false) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const isSameDay = format(startDate, 'yyyy.MM.dd') === format(endDate, 'yyyy.MM.dd');
    
    const startDayOfWeek = dayOfWeekMap[format(startDate, 'E')]; // 요일을 한국어로 변환
    const endDayOfWeek = dayOfWeekMap[format(endDate, 'E')]; // 요일을 한국어로 변환

    // 유효한 날짜 계산
    const validDays = eachDayOfInterval({ start: startDate, end: endDate })
        .filter(date => !isHoliday(date)); // 휴일 제외
    
    const dayDifference = validDays.length; // 유효한 날짜 수

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
