const Transaction = require('../models/Transaction');
const Card = require('../models/Card');

exports.getAllTransactions = async (req, res) => {
    try {
        const userId = req.user.member_id;
        const userCards = await Card.find({ member_id: userId });

        const cardIds = userCards.map(card => card._id); 
        const transactions = await Transaction.find({ card_id: { $in: cardIds } }).sort({ transaction_date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

// 트랜잭션 생성 함수
exports.createTransaction = async (req, res) => {
    const { card_id, transaction_date, merchant_name, menu_name, transaction_amount } = req.body;

    try {
        // 입력된 데이터에서 공백과 제어 문자 제거
        const sanitizeInput = (input) => {
            return input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;
        };

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        // 해당 카드 찾기
        const card = await Card.findById(card_id);

        if (!card) {
            return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
        }

        // 이번 달의 트랜잭션 가져오기
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        const transactionsThisMonth = await Transaction.find({
            card_id: card_id,
            transaction_date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // 이번 달 사용 금액 계산
        const totalSpentThisMonth = transactionsThisMonth.reduce((total, transaction) => total + transaction.transaction_amount, 0);
        const availableLimit = card.limit + card.rollover_amount; // 이번 달 사용 가능 금액

        // 이번 달 남은 금액 계산
        if (totalSpentThisMonth + Number(transaction_amount) > availableLimit) {
            return res.status(400).json({ error: '이번 달 사용 한도를 초과했습니다.' });
        }

        // 트랜잭션 생성 및 저장
        const transaction = new Transaction({
            card_id,
            transaction_date,
            merchant_name: sanitizedMerchantName,
            menu_name: sanitizedMenuName,
            transaction_amount
        });

        await transaction.save();

        res.status(201).json(transaction);

    } catch (error) {
        console.error('트랜잭션 생성 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction', error });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        // 입력된 데이터에서 공백과 제어 문자 제거
        const sanitizeInput = (input) => {
            return input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;
        };

        const { merchant_name, menu_name, transaction_amount, transaction_date } = req.body;

        // 제어 문자와 공백 제거
        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        // 업데이트할 데이터 준비
        const updateData = {
            ...(transaction_amount !== undefined && { transaction_amount }),
            ...(transaction_date !== undefined && { transaction_date }),
            ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
            ...({ menu_name: sanitizedMenuName !== undefined ? sanitizedMenuName : '' }),
        };

        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction', error });
    }
};


exports.deleteTransaction = async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};


exports.getTransactionsByYearAndMonth = async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.member_id;  // 요청한 사용자의 member_id

        // 1. 사용자가 소유한 카드 조회
        const userCards = await Card.find({ member_id: userId });

        // 2. 사용자의 카드들에 해당하는 트랜잭션만 가져옴
        const cardIds = userCards.map(card => card._id);  // 사용자의 카드 ID 목록

        // 3. 연도와 월에 맞는 트랜잭션을 해당 카드 ID로 필터링
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate);  // startDate로부터 새로운 객체 생성
        endDate.setMonth(endDate.getMonth() + 1);  // 다음 달로 설정

        const transactions = await Transaction.find({
            card_id: { $in: cardIds },
            transaction_date: { $gte: startDate, $lt: endDate }
        })
        //.populate('card_id', 'card_number') // card_id를 통해 card_number를 가져옴
        .sort({ transaction_date: -1 }); 

        console.log(transactions);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions by year and month', error });
    }
};

