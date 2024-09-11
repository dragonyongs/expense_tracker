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
    const { card_id, transaction_date, merchant_name, menu_name, transaction_amount, transaction_type } = req.body;

    try {
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

        // 입금인지 지출인지 구분
        if (transaction_type === '지출') {
            // 잔액이 충분한지 확인
            if (card.balance < transaction_amount) {
                return res.status(400).json({ error: '잔액이 부족합니다.' });
            }

            // 잔액에서 지출 금액 차감
            card.balance -= transaction_amount;
        } else if (transaction_type === '입금') {
            // 입금일 경우 별도의 잔액 업데이트는 없음 (관리자가 이미 처리)
        }

        // 이번 달 사용 금액 계산
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        const transactionsThisMonth = await Transaction.find({
            card_id: card_id,
            transaction_date: { $gte: startOfMonth, $lte: endOfMonth },
            transaction_type: '지출'  // 지출 트랜잭션만 계산
        });

        const totalSpentThisMonth = transactionsThisMonth.reduce((total, transaction) => total + transaction.transaction_amount, 0);
        const availableLimit = card.limit + card.rollover_amount;  // 사용 가능 금액

        // 사용 한도 초과 여부 확인
        if (totalSpentThisMonth + Number(transaction_amount) > availableLimit) {
            return res.status(400).json({ error: '이번 달 사용 한도를 초과했습니다.' });
        }

        // 지출 트랜잭션 생성 및 저장
        const transaction = new Transaction({
            card_id,
            transaction_date,
            merchant_name: sanitizedMerchantName,
            menu_name: sanitizedMenuName,
            transaction_amount,
            transaction_type: transaction_type
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

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        // 트랜잭션 금액의 차이 계산
        const previousAmount = transaction.transaction_amount;
        const newAmount = transaction_amount !== undefined ? transaction_amount : previousAmount;

        // 카드 잔액 업데이트
        const difference = newAmount - previousAmount;
        card.balance -= difference; // 기존 금액보다 크면 차감, 작으면 더함

        // 카드 잔액 업데이트 저장
        await card.save();

        // 트랜잭션 업데이트
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
        // 삭제할 트랜잭션 찾기
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        // 지출 트랜잭션일 경우 잔액 복구
        if (transaction.transaction_type === '지출') {
            card.balance += transaction.transaction_amount;
        }

        await card.save(); // 업데이트된 잔액 저장
        await transaction.deleteOne(); // 트랜잭션 삭제

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};


exports.getAllDeposits = async (req, res) => {
    try {
        const deposits = await Transaction.find({ transaction_type: "입금" }).populate('card_id');

        const depositWithMemberNames = await Promise.all(deposits.map(async (deposit) => {
            const card = deposit.card_id;
            if (card) {
                const cardMember = await Card.findById(card._id).populate('member_id');

                return {
                    ...deposit.toObject(), // deposit 객체를 일반 객체로 변환
                    member_name: cardMember.member_id ? cardMember.member_id.member_name : null // member_id에서 이름 추출
                };
            }
            return deposit; // 카드가 없는 경우 원래 deposit 반환
        }));

        res.status(200).json(depositWithMemberNames);
    } catch (error) {
        res.status(500).json({ message: 'Error Deposits', error });
    }
}

exports.getTransactionsByYearAndMonth = async (req, res) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.member_id;

        const userCards = await Card.find({ member_id: userId });

        const cardIds = userCards.map(card => card._id);

        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const transactions = await Transaction.find({
            card_id: { $in: cardIds },
            transaction_date: { $gte: startDate, $lt: endDate }
        })
        .populate('card_id', 'card_number')
        .sort({ transaction_date: -1 }); 

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions by year and month', error });
    }
};

// exports.depositToCard = async (req, res) => {
//     try {
//         const { card_id, deposit_amount } = req.body;
        
//         // 카드 찾기
//         const card = await Card.findById(card_id);
//         if (!card) {
//             return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
//         }

//         const { limit, balance, rollover_amount } = card;
//         const totalLimit = limit + rollover_amount; // 총 사용 가능한 금액

//         // 현재 사용 가능한 잔액 (잔액 + 이월 금액을 포함한 최대 사용 가능 한도)
//         const currentTotal = balance;

//         // 입금 가능한 최대 금액 계산
//         const maxDeposit = totalLimit - currentTotal;
//         const actualDeposit = Math.min(deposit_amount, maxDeposit); // 입금할 수 있는 금액 (최대 한도 초과하지 않도록)

//         if (actualDeposit <= 0) {
//             return res.status(400).json({ error: '입금할 수 있는 금액이 없습니다. 이미 최대 한도에 도달했습니다.' });
//         }

//         // 카드 잔액 업데이트
//         card.balance += actualDeposit;

//         // 입금 트랜잭션 생성
//         const depositTransaction = new Transaction({
//             card_id,
//             transaction_date: new Date(),
//             merchant_name: '관리자',
//             menu_name: '잔액 충전',
//             transaction_amount: actualDeposit,
//             transaction_type: '입금'  // 트랜잭션 타입을 명시적으로 구분
//         });

//         await card.save();  // 카드 모델에 잔액 저장
//         await depositTransaction.save();  // 입금 트랜잭션 저장

//         res.status(201).json({ message: '카드에 입금되었습니다.', card, transaction: depositTransaction });
//     } catch (error) {
//         console.error('입금 처리 중 오류 발생:', error);
//         res.status(500).json({ message: '입금 처리 중 서버 오류가 발생했습니다.', error });
//     }
// };

exports.handleDeposit = async (req, res) => {
    try {
        const { card_id, deposit_amount } = req.body;
        const card = await Card.findById(card_id);

        if (!card) return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });

        // 이번 달의 잔액 계산 (rollover_amount + balance)
        const currentBalance = card.balance;
        const rolloverAmount = card.rollover_amount;

        // 전월 이월 조건: 잔액이 1만원 미만인 경우
        let amountToDeposit = deposit_amount;

        if (currentBalance < 10000) {
            const totalLimit = card.limit; // 한도 10만원
            const totalBalance = currentBalance + deposit_amount;

            if (totalBalance > totalLimit) {
                amountToDeposit = totalLimit - currentBalance;
            }

            // 입금 트랜잭션 생성
            const depositTransaction = new Transaction({
                card_id: card_id,
                transaction_date: new Date(),
                merchant_name: '관리자',
                menu_name: '잔액 충전',
                transaction_amount: amountToDeposit,
                transaction_type: '입금'
            });

            await depositTransaction.save();

            // 카드 잔액 업데이트
            card.balance += amountToDeposit;
            await card.save();

            res.status(201).json({ message: '입금이 완료되었습니다.', transaction: depositTransaction });
        } else {
            return res.status(400).json({ error: '잔액이 1만원 이상이므로 입금할 수 없습니다.' });
        }
    } catch (error) {
        console.error('입금 처리 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
};
