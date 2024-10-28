export const formatDateForInput = (dateString) => {
    if (!dateString) return ''; // 빈 값 처리
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // yyyy-MM-dd 형식으로 반환
};

export const formatDateToKorean = (dateString, format = 'full') => {
    if (!dateString) return ''; // 빈 값 처리
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');

    if (format === 'full') {
        return `${year}년 ${month}월 ${day}일`; // 전체 형식
    } else if (format === 'monthDay') {
        return `${month}월 ${day}일`; // 월과 일만
    }
    return ''; // 기본값
};

export const isTodayBirthday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
};

export const calculateYearsSinceEntry = (dates) => {
    const entryDates = dates.filter(date => date.date_type === 'entry');

    // 입사 날짜가 없을 경우 0을 반환
    if (entryDates.length === 0) {
        return { years: 0, days: 0 }; // 객체로 반환
    }

    const latestEntryDate = entryDates.reduce((latest, date) => {
        const currentDate = new Date(date.date);
        return currentDate > latest ? currentDate : latest;
    }, new Date(0));

    const now = new Date();
    const yearsDifference = now.getFullYear() - latestEntryDate.getFullYear();

    // 만약 현재 날짜가 가장 최근의 입사일이 지나지 않았다면 -1을 반환
    const isPastAnniversary = now.getMonth() > latestEntryDate.getMonth() || 
        (now.getMonth() === latestEntryDate.getMonth() && now.getDate() >= latestEntryDate.getDate());

    // 일 수 계산
    const daysDifference = Math.floor((now - latestEntryDate) / (1000 * 60 * 60 * 24));

    return {
        years: yearsDifference + (isPastAnniversary ? 1 : 0),
        days: daysDifference
    };
};
