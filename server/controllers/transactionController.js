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
// const calculateTotalSpent = async (cardId) => {
//     try {
//         const transactions = await Transaction.find({ card_id: cardId, transaction_type: '지출' });
//         return transactions.reduce((total, tx) => total + Number(tx.transaction_amount), 0);
//     } catch (error) {
//         console.error('Error calculating total spent:', error);
//         throw new Error('총 지출 금액 계산 중 오류가 발생했습니다.');
//     }
// };

// 트랜잭션 생성 및 처리 함수
exports.createTransaction = async (req, res) => {
    const { card_id, transaction_date, merchant_name, menu_name, transaction_amount, transaction_type, deposit_type, expense_type } = req.body;

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

        let remainingAmount = Number(transaction_amount); // 거래 금액 초기화

        if (transaction_type === 'expense') {
            // 현재 잔액과 이월 금액 합산
            const availableBalance = Number(card.balance + card.rollover_amount);
            
            // 잔액과 이월 금액을 기준으로 결제 가능 여부 확인
            if (remainingAmount > availableBalance) {
                return res.status(400).json({ error: '잔액 및 이월 금액이 부족합니다.' });
            }

            // 잔액에서 지출 처리
            let usedAmount = Number(0); // 실제 사용된 금액

            // expense_type에 따라 처리
            if (expense_type === 'TeamFund') {
                // 팀 운영비인 경우
                // 카드의 team_fund에서 차감
                if (card.team_fund >= remainingAmount) {
                    card.team_fund -= remainingAmount;
                    usedAmount = remainingAmount; // 팀 운영비에서 사용된 금액 기록
                } else {
                    return res.status(400).json({ error: '팀 운영비 잔액이 부족합니다.' });
                }
            } else {
                if (card.balance >= remainingAmount) {
                    card.balance -= remainingAmount;
                    usedAmount = remainingAmount; // 전체 사용 금액
                } else {
                    usedAmount = card.balance; // 카드 잔액이 부족할 경우 최대 사용 금액
                    remainingAmount -= card.balance;
                    card.balance = 0;

                    // 이월 금액에서 추가 차감
                    if (remainingAmount > 0 && card.rollover_amount >= remainingAmount) {
                        card.rollover_amount -= remainingAmount;
                        remainingAmount = 0;
                    } else if (remainingAmount > 0) {
                        return res.status(400).json({ error: '잔액 및 이월 금액이 부족합니다.' });
                    }
                }
            }

            // 트랜잭션 기록 (사용 금액)
            const transaction = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: Number(usedAmount),
                transaction_type,
                deposit_type,
                expense_type
            });

            // 트랜잭션 저장 및 카드 정보 업데이트
            await transaction.save();
            await card.save();

            res.status(201).json({ 
                message: '트랜잭션 처리 성공', 
                transaction: transaction.toObject(), 
                card: card.toObject() 
            });

        } else if (transaction_type === 'income') {
            let depositAmount = Number(0);

            // 입금 유형별 처리 로직
            if (deposit_type === 'RegularDeposit') {
                // 매월 정기 입금 (기본 10만 원)
                const maxLimit = card.limit || 100000;
                depositAmount = Math.min(maxLimit - card.balance, transaction_amount);
                card.balance += Number(depositAmount);
            } else if (deposit_type === 'AdditionalDeposit') {
                // 추가 입금
                depositAmount = transaction_amount;
                card.balance += Number(depositAmount);
            } else if (deposit_type === 'TransportationExpense') {
                // 여비 교통비 입금
                depositAmount = transaction_amount;
                card.balance += Number(depositAmount);  // 여비 교통비는 추가 금액이므로 그대로 반영
            } else if (deposit_type === 'TeamFund') {
                // 팀 운영비 입금
                depositAmount = transaction_amount;  // 팀 운영비는 별도 관리
                card.team_fund += Number(depositAmount);  // 팀 운영비 잔액 추가
            }

            // 트랜잭션 기록 (입금 금액)
            const transaction = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: depositAmount, // 입금된 금액 기록
                transaction_type,
                deposit_type // 입금 유형 기록
            });

            // 트랜잭션 저장 및 카드 정보 업데이트
            await transaction.save();
            await card.save();

            res.status(201).json({ 
                message: '트랜잭션 처리 성공', 
                transaction: transaction.toObject(), 
                card: card.toObject() 
            });

        } else {
            return res.status(400).json({ error: '유효하지 않은 거래 유형입니다.' });
        }

    } catch (error) {
        console.error('트랜잭션 생성 중 오류 발생:', error);
        res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.', error});
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

        const { merchant_name, menu_name, transaction_amount, transaction_date, transaction_type, expense_type } = req.body;

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        const updateData = {
            ...(transaction_amount !== undefined && { transaction_amount }),
            ...(transaction_date !== undefined && { transaction_date }),
            ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
            ...(sanitizedMenuName !== undefined && { menu_name: sanitizedMenuName }),
            ...(expense_type !== undefined && { expense_type }) // 추가된 부분
        };

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const previousAmount = transaction.transaction_amount;
        const newAmount = transaction_amount !== undefined ? transaction_amount : previousAmount;

        // 기존의 지출 타입을 확인
        const previousExpenseType = transaction.expense_type;

        // 지출 타입이 변경되었는지 확인
        const isExpenseTypeChanged = expense_type && expense_type !== previousExpenseType;

        // expense_type이 변경된 경우 추가 로직
        if (transaction_type === 'expense') {
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
            // 지출 타입에 따라 잔액 처리
            if (previousExpenseType === 'TeamFund') {
                // 이전 지출 타입이 TeamFund인 경우
                card.team_fund += previousAmount; // 이전 금액을 팀 펀드에 다시 추가
                
                if (expense_type === 'TeamFund') {
                    // 팀 펀드에서 지출할 경우
                    card.team_fund -= newAmount; // 팀 펀드에서 차감
                } else {
                    // 팀 펀드가 아닌 경우
                    card.balance -= newAmount; // 카드 잔액에서 차감
                }
            } else {
                // 기존이 일반 지출인 경우
                if (expense_type === 'TeamFund') {
                    // 일반 지출에서 팀 펀드로 변경된 경우
                    card.team_fund -= newAmount; // 팀 펀드에서 차감
                } else {
                    // 일반 지출로 계속할 경우
                    card.balance -= difference; // 차액을 잔액에서 차감
                }
            }
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

        console.log('Transaction Expense Type:', transaction.expense_type);

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        // 지출 트랜잭션일 경우 잔액 복구
        if (transaction.transaction_type === 'expense') {
            if (transaction.expense_type === 'TeamFund') {
                // 팀 운영비인 경우 팀 운영비에서 금액 차감
                card.team_fund += transaction.transaction_amount; // 팀 운영비에서 금액 복구
                card.team_fund = Math.max(card.team_fund, 0); // 잔액이 음수가 되지 않도록
                console.log('팀운영비 지출 복구 완료!');
            } else {
                // 일반 지출의 경우 카드 잔액 복구
                console.log('팀카드 지출 복구 완료!');
                card.balance += transaction.transaction_amount;
            }
        }

        console.log('card Balance: ', card.balance);
        console.log('card team_fund: ', card.team_fund);

        await card.save(); // 업데이트된 잔액 저장
        await transaction.deleteOne(); // 트랜잭션 삭제

        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};

exports.getAllDeposits = async (req, res) => {
    try {
        const deposits = await Transaction.find({ transaction_type: "income" }).populate('card_id');

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