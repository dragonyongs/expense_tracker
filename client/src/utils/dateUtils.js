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
    const entryDates = dates.filter(date => date.date_type === 'entry').map(date => new Date(date.date));
    const leaveDates = dates.filter(date => date.date_type === 'leave').map(date => new Date(date.date));

    if (entryDates.length === 0) {
        return { years: 0, days: 0 }; // 입사 기록이 없는 경우
    }

    // 가장 최근 입사일 및 초기 입사일 찾기
    const latestEntryDate = entryDates.reduce((latest, date) => date > latest ? date : latest, new Date(0));
    const earliestEntryDate = entryDates.reduce((earliest, date) => date < earliest ? date : earliest, new Date());

    // 가장 최근 퇴사일 (없을 수도 있음)
    const latestLeaveDate = leaveDates.reduce((latest, date) => date > latest ? date : latest, null);

    const now = new Date();

    if (latestLeaveDate && latestLeaveDate > latestEntryDate) {
        // 퇴사자인 경우: 입사일~퇴사일까지 계산
        const totalDays = Math.floor((latestLeaveDate - latestEntryDate) / (1000 * 60 * 60 * 24));
        const totalYears = Math.floor(totalDays / 365);

        return {
            years: totalYears,
            days: totalDays
        };
    } else {
        // 재직 중인 경우: 초기 입사일, 퇴사 후 재입사 포함 현재까지 계산
        const firstPeriodDays = leaveDates.length > 0
            ? Math.floor((latestLeaveDate - earliestEntryDate) / (1000 * 60 * 60 * 24))
            : 0;

        const secondPeriodDays = Math.floor((now - latestEntryDate) / (1000 * 60 * 60 * 24));
        const totalDays = firstPeriodDays + secondPeriodDays;
        const totalYears = Math.floor(totalDays / 365);

        return {
            years: totalYears + 1,
            days: totalDays + 1
        };
    }
};