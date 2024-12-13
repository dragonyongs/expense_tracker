import axios from 'axios';
import { API_URLS } from '../services/apiUrls';

export const handleDepositOpenDrawer = async (deposit, isEditing, isOpen, setCards, setSelectedDeposit, setSelectedCardId, setSelectedUserId, setDepositType, setErrMsg, setIsOpen, setIsEditing) => {

    try {

        const memberId = deposit?.card_id?.member_id || null;
        const cardId = deposit?.card_id?._id || null;
        const depositType = deposit?.deposit_type || "RegularDeposit";

        setIsEditing(true);
        setIsOpen(true);
        setSelectedCardId(cardId);
        setSelectedUserId(memberId);
        setDepositType(depositType);

        const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
        const cardTransactions = transactionsResponse.data;
        
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        
        const filteredMonthTransactions = cardTransactions.filter(tx => {
            const transactionDate = new Date(tx.transaction_date);
            return (
                transactionDate.getMonth() === currentMonth && 
                transactionDate.getFullYear() === currentDate.getFullYear() &&
                tx.transaction_type === "income" &&
                tx.depositType === depositType
            );
        });
        
        const response = await axios.get(`${API_URLS.CARDS}/member/${memberId}`);
        const userCards = response.data;
        setCards(userCards);

        let transactionAmount = deposit?.transaction_amount;

        if (!isEditing && filteredMonthTransactions.length === 0) {
            transactionAmount = depositType === "TeamFund" ? 30000 : 100000;
        }

        setSelectedDeposit({
            ...deposit,
            transaction_amount: transactionAmount, // 초기화된 금액 설정
            deposit_type: depositType,  // 입금 유형 설정
        });

        console.log('isEditing', isEditing);
        console.log('isOpen', isOpen);
        console.log('transactionAmount', transactionAmount);

    } catch (error) {
        setErrMsg("카드 정보를 가져오는 데 실패했습니다.");
    }
};
