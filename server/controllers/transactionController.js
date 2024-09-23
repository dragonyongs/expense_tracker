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

exports.getCardTransactions = async (req, res) => {
    try {
        const { cardId } = req.params;
        const transactions = await Transaction.find({ card_id: cardId });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ message: "해당 카드의 트랜잭션을 찾을 수 없습니다." });
        }

        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ message: "트랜잭션 조회 중 오류가 발생했습니다.", error });
    }
};

// 총 지출 금액 계산 함수
const calculateTotalSpent = async (cardId) => {
    try {
        const transactions = await Transaction.find({ card_id: cardId, transaction_type: '지출' });
        return transactions.reduce((total, tx) => total + Number(tx.transaction_amount), 0);
    } catch (error) {
        console.error('Error calculating total spent:', error);
        throw new Error('총 지출 금액 계산 중 오류가 발생했습니다.');
    }
};

// 트랜잭션 생성 및 처리 함수
exports.createTransaction = async (req, res) => {
    const { card_id, transaction_date, merchant_name, menu_name, transaction_amount, transaction_type } = req.body;

    try {
        // 입력 값 정리 함수 (제어 문자 제거 및 공백 제거)
        const sanitizeInput = (input) => input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        // 해당 카드 찾기
        const card = await Card.findById(card_id);
        if (!card) {
            return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
        }

        let remainingAmount = Number(transaction_amount);

        if (transaction_type === '지출') {
            // 현재 잔액과 이월 금액 합산
            const availableBalance = Number(card.balance + card.rollover_amount);
            console.log(remainingAmount, availableBalance);
            
            // 잔액과 이월 금액을 기준으로 결제 가능 여부 확인
            if (remainingAmount > availableBalance) {
                return res.status(400).json({ error: '잔액 및 이월 금액이 부족합니다.' });
            }
        
            // 잔액에서 지출 처리
            if (card.balance >= remainingAmount) {
                card.balance -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= card.balance;
                card.balance = 0;
        
                // 이월 금액에서 추가 차감
                if (remainingAmount > 0 && card.rollover_amount >= remainingAmount) {
                    card.rollover_amount -= remainingAmount;
                    remainingAmount = 0;
                }
            }
        } else if (transaction_type === '입금') {
            // 관리자가 입금하는 경우
            if (card.balance < 10000) {
                // 잔액이 1만원 미만일 경우 이월 처리
                card.rollover_amount = card.balance;
                card.balance = card.limit;
            } else {
                // 잔액이 1만원 이상일 경우 차액만 입금
                const depositAmount = card.limit - card.balance;
                card.balance += depositAmount;
                remainingAmount = depositAmount;
            }
        }

        // 트랜잭션 기록
        const transaction = new Transaction({
            card_id,
            transaction_date,
            merchant_name: sanitizedMerchantName,
            menu_name: sanitizedMenuName,
            transaction_amount,
            transaction_type
        });

        // 트랜잭션 저장 및 카드 정보 업데이트
        await transaction.save();
        await card.save();

        res.status(201).json({ 
            message: '트랜잭션 처리 성공', 
            transaction: transaction.toObject(), 
            card: card.toObject() 
        });

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

// exports.updateTransaction = async (req, res) => {
//     try {
//         const sanitizeInput = (input) => {
//             return input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;
//         };

//         const { merchant_name, menu_name, transaction_amount, transaction_date, transaction_type } = req.body;

//         // 제어 문자와 공백 제거
//         const sanitizedMerchantName = sanitizeInput(merchant_name);
//         const sanitizedMenuName = sanitizeInput(menu_name);

//         // 업데이트할 데이터 준비
//         const updateData = {
//             ...(transaction_amount !== undefined && { transaction_amount }),
//             ...(transaction_date !== undefined && { transaction_date }),
//             ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
//             ...(sanitizedMenuName !== undefined && { menu_name: sanitizedMenuName }),
//         };

//         const transaction = await Transaction.findById(req.params.id);
//         if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

//         const card = await Card.findById(transaction.card_id);
//         if (!card) return res.status(404).json({ message: 'Card not found' });

//         // 이월 금액과 한도를 고려한 계산
//         const totalLimit = card.limit + card.rollover_amount;  // 한도 + 이월 금액
//         const previousAmount = transaction.transaction_amount;
//         const newAmount = transaction_amount !== undefined ? transaction_amount : previousAmount;

//         if (transaction_type === '지출') {
//             // 트랜잭션 금액의 차이 계산
//             const difference = newAmount - previousAmount;

//             // 카드 잔액 업데이트
//             const updatedBalance = card.balance - difference;

//             // 사용 한도 초과 여부 확인
//             const transactionsThisMonth = await Transaction.find({
//                 card_id: card._id,
//                 transaction_type: '지출',
//                 transaction_date: { 
//                     $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//                     $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
//                 }
//             });

//             const totalSpentThisMonth = transactionsThisMonth.reduce((total, txn) => total + txn.transaction_amount, 0);

//             if (totalSpentThisMonth + difference > totalLimit) {
//                 return res.status(400).json({ error: '이번 달 사용 한도를 초과했습니다.' });
//             }

//             // 한도를 초과하지 않는 경우 잔액 저장
//             card.balance = updatedBalance;
//         } else if (transaction_type === '입금') {
//             // 입금 트랜잭션의 경우 잔액을 처리하지 않음
//         }

//         // 카드 정보 저장
//         await card.save();

//         // 트랜잭션 업데이트
//         const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, { new: true });
//         if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });

//         res.status(200).json(updatedTransaction);
//     } catch (error) {
//         console.error('Error updating transaction:', error);
//         res.status(500).json({ message: 'Error updating transaction', error });
//     }
// };

exports.updateTransaction = async (req, res) => {
    try {
        const sanitizeInput = (input) => {
            return input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;
        };

        const { merchant_name, menu_name, transaction_amount, transaction_date, transaction_type } = req.body;

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        const updateData = {
            ...(transaction_amount !== undefined && { transaction_amount }),
            ...(transaction_date !== undefined && { transaction_date }),
            ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
            ...(sanitizedMenuName !== undefined && { menu_name: sanitizedMenuName }),
        };

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const previousAmount = transaction.transaction_amount;
        const newAmount = transaction_amount !== undefined ? transaction_amount : previousAmount;

        if (transaction_type === '지출') {
            const availableBalance = card.balance + card.rollover_amount;
            const difference = newAmount - previousAmount;

            // 수정할 금액이 기존 금액보다 크면 잔액 확인
            if (newAmount > previousAmount) {
                // 현재 카드 잔액에서 차액을 제외한 금액으로 체크
                const potentialNewBalance = availableBalance - difference;

                // 사용 가능한 잔액 체크
                if (potentialNewBalance < 0) {
                    return res.status(400).json({ error: '잔액이 부족합니다.' });
                }
            }

            // 카드 잔액 업데이트
            card.balance -= difference; // 차액을 잔액에서 차감
        }

        await card.save();

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

exports.handleAdminDeposit = async (req, res) => {
    try {
        const { card_id } = req.body;
        const card = await Card.findById(card_id);
        
        if (!card) {
            return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
        }

        // 현재 잔액 확인
        let currentBalance = card.balance;

        if (currentBalance < 10000) {
            // 잔액이 1만 원 미만일 경우, 남은 금액을 이월하고 잔액을 10만 원으로 설정
            card.rollover_amount = currentBalance;
            card.balance = 100000;
        } else {
            // 잔액이 1만 원 이상일 경우, 10만 원에서 현재 잔액을 제외한 차액만 더함
            const difference = 100000 - currentBalance;
            card.balance = currentBalance + difference;
        }

        // 트랜잭션 기록 (입금)
        const transaction = new Transaction({
            card_id,
            transaction_amount: card.balance - currentBalance, // 차액만큼 기록
            merchant_name: '관리자',
            menu_name: '잔액 충전',
            transaction_type: '입금',
            transaction_date: new Date(),
        });

        await transaction.save();
        await card.save();

        return res.status(200).json({ message: '입금 처리 성공', card });
    } catch (error) {
        console.error('입금 처리 중 오류:', error);
        return res.status(500).json({ message: '입금 처리 중 오류가 발생했습니다.' });
    }
};

// exports.handleDeposit = async (req, res) => {
//     try {
//         const { card_id, deposit_amount } = req.body;
//         const card = await Card.findById(card_id);

//         if (!card) return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });

//         // 이번 달의 잔액 계산 (rollover_amount + balance)
//         const currentBalance = card.balance;
//         const rolloverAmount = card.rollover_amount;

//         // 전월 이월 조건: 잔액이 1만원 미만인 경우
//         let amountToDeposit = deposit_amount;

//         if (currentBalance < 10000) {
//             const totalLimit = card.limit; // 한도 10만원
//             const totalBalance = currentBalance + deposit_amount;

//             if (totalBalance > totalLimit) {
//                 amountToDeposit = totalLimit - currentBalance;
//             }

//             // 입금 트랜잭션 생성
//             const depositTransaction = new Transaction({
//                 card_id: card_id,
//                 transaction_date: new Date(),
//                 merchant_name: '관리자',
//                 menu_name: '잔액 충전',
//                 transaction_amount: amountToDeposit,
//                 transaction_type: '입금'
//             });

//             await depositTransaction.save();

//             // 카드 잔액 업데이트
//             card.balance += amountToDeposit;
//             await card.save();

//             res.status(201).json({ message: '입금이 완료되었습니다.', transaction: depositTransaction });
//         } else {
//             return res.status(400).json({ error: '잔액이 1만원 이상이므로 입금할 수 없습니다.' });
//         }
//     } catch (error) {
//         console.error('입금 처리 중 오류 발생:', error);
//         res.status(500).json({ error: '서버 오류 발생' });
//     }
// };
