const calculateUniqueTeamMembersCount = (accounts) => {
    if (!Array.isArray(accounts) || accounts.length === 0) {
        return 0;
    }

    let memberArray = [];

    accounts.forEach(account => {
        (account.cards || []).forEach(card => {
            if (card.card_type !== "OvertimeMealCard" && card.member_id) {
                memberArray.push(card.member_id);
            }
        });
    });

    memberArray.reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

    // console.log('memberArray.length', memberArray.length);

    return memberArray.length;
};

export default calculateUniqueTeamMembersCount;
