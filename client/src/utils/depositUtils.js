export const calculateTeamDepositAmount = (cards, teamMembersCount) => {
    const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
    const threshold = 10000 / teamMembersCount; // 1인당 기준 금액

    return cards.map((card) => {
        const remainingAmount = Math.max(0, card.limit - card.balance); // 잔액 기준 차감
        
        if (totalBalance < 10000) {
            // 총 잔액이 1만 원 미만일 경우 카드 한도에 따라 10만 원 입금
            return {
                ...card,
                depositAmount: 100000,
            };
        } else if (card.balance < threshold) {
            // 잔액이 기준 미만인 경우만 10만 원 - 현재 잔액 입금
            return {
                ...card,
                depositAmount: remainingAmount,
            };
        } else {
            // 기준 이상인 경우 입금하지 않음
            return {
                ...card,
                depositAmount: 0,
            };
        }
    });
};