const calculateTeamMembersCount = (accounts) => {
    if (!Array.isArray(accounts)) return 0;
    return accounts.reduce((count, account) => {
        const validCards = account.cards?.filter(card => card.card_type !== "OvertimeMealCard") || [];
        return count + validCards.length;
    }, 0);
};

export default calculateTeamMembersCount;
