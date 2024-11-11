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
// exports.createTransaction = async (req, res) => {
//     const { card_id, transaction_date, merchant_name, menu_name, transaction_amount, transaction_type, deposit_type, expense_type } = req.body;


//     // 금액 차감 함수
//     const subtractAmount = (sourceAmount, amountNeeded) => {
//         const usedAmount = Math.min(sourceAmount, amountNeeded);
//         return { remainingAmount: amountNeeded - usedAmount, usedAmount };
//     };

//     // TeamFund 지출 처리 로직
//     const handleTeamFundExpense = (card, remainingAmount) => {
//         // console.log('Team 카드 잔액', card.team_fund);
//         // console.log('지출 금액', remainingAmount);

//         if (card.team_fund >= remainingAmount) {
//             card.team_fund -= remainingAmount;
//             return { remainingAmount: 0, teamFundUsed: remainingAmount };
//         } else {
//             throw new Error('팀 운영비 잔액이 부족합니다.');
//         }
//     };

//     // 잔액 차감 로직
//     const handleBalanceExpense = (card, remainingAmount) => {
//         const { remainingAmount: remainingAfterBalance, usedAmount: balanceUsed } = subtractAmount(card.balance, remainingAmount);
//         card.balance -= balanceUsed;
//         return { remainingAmount: remainingAfterBalance, cardBalanceUsed: balanceUsed };
//     };

//     // 이월 금액 차감 로직
//     const handleRolloverExpense = (card, remainingAmount) => {
//         const { remainingAmount: remainingAfterRollover, usedAmount: rolloverUsed } = subtractAmount(card.rollover_amount, remainingAmount);
//         card.rollover_amount -= rolloverUsed;
//         return { remainingAmount: remainingAfterRollover, rolloverUsed };
//     };

//     try {
//         // 입력 값 정리 함수 (제어 문자 제거 및 공백 제거)
//         const sanitizeInput = (input) => input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;

//         const sanitizedMerchantName = sanitizeInput(merchant_name);
//         const sanitizedMenuName = sanitizeInput(menu_name);

//         // 해당 카드 찾기
//         const card = await Card.findById(card_id);
//         if (!card) {
//             return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
//         }

//         console.log('팀펀드 차감 전:', card.team_fund); // 차감 전 상태 출력

//         let remainingAmount = Number(transaction_amount); // 거래 금액 초기화

//         // 지출 처리
//         if (transaction_type === 'expense') {
//             // let { remainingAmount } = transaction_amount;
//             let usedAmount = 0;
//             let rolloverUsed = 0;
//             let teamFundUsed = 0;
//             let cardBalanceUsed = 0;

//             if (expense_type === 'TeamFund') {
//                 // TeamFund에서 전액 처리
//                 ({ remainingAmount, teamFundUsed } = handleTeamFundExpense(card, remainingAmount));
//             } else {
//                 // 일반 지출 처리
//                 ({ remainingAmount, cardBalanceUsed } = handleBalanceExpense(card, remainingAmount));

//                 if (remainingAmount > 0) {
//                     // 잔액 부족 시 이월 금액 사용
//                     ({ remainingAmount, rolloverUsed } = handleRolloverExpense(card, remainingAmount));

//                     if (remainingAmount > 0) {
//                         // 이월 금액도 부족하면 TeamFund 사용
//                         ({ remainingAmount, teamFundUsed } = handleTeamFundExpense(card, remainingAmount));
//                     }
//                 }
//             }

//             // 트랜잭션 기록
//             const transaction = new Transaction({
//                 card_id,
//                 transaction_date,
//                 merchant_name: sanitizedMerchantName,
//                 menu_name: sanitizedMenuName,
//                 transaction_amount: transaction_amount - remainingAmount, // 총 사용 금액
//                 transaction_type,
//                 deposit_type,
//                 expense_type,
//                 rolloverAmounted: rolloverUsed,
//                 teamFundDeducted: teamFundUsed,
//             });

//             await transaction.save();
//             await card.save();

//             res.status(201).json({
//                 message: '트랜잭션 처리 성공',
//                 transaction: transaction.toObject(),
//                 card: card.toObject()
//             });
//         } else if (transaction_type === 'income') {
//             let depositAmount = Number(0);

//             // 입금 유형별 처리 로직
//             if (deposit_type === 'RegularDeposit') {
//                 // 매월 정기 입금 (기본 10만 원)
//                 const maxLimit = card.limit || 100000;
//                 depositAmount = Math.min(maxLimit - card.balance, transaction_amount);
//                 card.balance += Number(depositAmount);
//             } else if (deposit_type === 'AdditionalDeposit') {
//                 // 추가 입금
//                 depositAmount = transaction_amount;
//                 card.balance += Number(depositAmount);
//             } else if (deposit_type === 'TransportationExpense') {
//                 // 여비 교통비 입금
//                 depositAmount = transaction_amount;
//                 card.balance += Number(depositAmount);  // 여비 교통비는 추가 금액이므로 그대로 반영
//             } else if (deposit_type === 'TeamFund') {
//                 // 팀 운영비 입금
//                 depositAmount = transaction_amount;  // 팀 운영비는 별도 관리
//                 card.team_fund += Number(depositAmount);  // 팀 운영비 잔액 추가
//             }

//             // 트랜잭션 기록 (입금 금액)
//             const transaction = new Transaction({
//                 card_id,
//                 transaction_date,
//                 merchant_name: sanitizedMerchantName,
//                 menu_name: sanitizedMenuName,
//                 transaction_amount: depositAmount, // 입금된 금액 기록
//                 transaction_type,
//                 deposit_type // 입금 유형 기록
//             });

//             // 트랜잭션 저장 및 카드 정보 업데이트
//             await transaction.save();
//             // console.log('expense 업데이트 전 카드 정보:', card);
//             await card.save();
//             // console.log('expense 업데이트 후 카드 정보:', card);

//             res.status(201).json({ 
//                 message: '트랜잭션 처리 성공', 
//                 transaction: transaction.toObject(), 
//                 card: card.toObject() 
//             });

//         } else {
//             return res.status(400).json({ error: '유효하지 않은 거래 유형입니다.' });
//         }

//     } catch (error) {
//         console.error('트랜잭션 생성 중 오류 발생:', error);
//         res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.', error});
//     }
// };
// 트랜잭션 생성 및 처리 함수
exports.createTransaction = async (req, res) => {
    const { card_id, transaction_date, merchant_name, menu_name, transaction_amount, transaction_type, deposit_type, expense_type } = req.body;

    // 금액 차감 공통 함수
    function subtractFromSource(card, source, amount) {
        let usedAmount = 0;
    
        if (card[source] >= amount) {
            usedAmount = amount;
            card[source] -= amount;
            amount = 0;
        } else {
            usedAmount = card[source];
            amount -= card[source];
            card[source] = 0;
        }
    
        return { remainingAmount: amount, usedAmount }; // 사용된 금액과 남은 미처리 금액 반환
    }

    const handleTeamFundExpense = (card, remainingAmount) => {
        return subtractFromSource(card, 'team_fund', remainingAmount);
    };
    
    const handleBalanceExpense = (card, remainingAmount) => {
        return subtractFromSource(card, 'balance', remainingAmount);
    };
    function handleRolloverExpense(card, amount) {
        let rolloverUsed = 0;
    
        if (card.rollover_amount >= amount) {
            rolloverUsed = amount;
            card.rollover_amount -= amount;
            amount = 0;
        } else {
            rolloverUsed = card.rollover_amount;
            amount -= card.rollover_amount;
            card.rollover_amount = 0;
        }
    
        return { remainingAmount: amount, rolloverUsed };
    }

    try {
        const sanitizeInput = (input) => input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        const card = await Card.findById(card_id);
        if (!card) {
            return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
        }

        let remainingAmount = Number(transaction_amount);

        if (transaction_type === 'expense') {
            let rolloverUsed = 0;
            let teamFundUsed = 0;
            let cardBalanceUsed = 0;

            if (expense_type === 'TeamFund') {
                ({ remainingAmount, teamFundUsed } = handleTeamFundExpense(card, remainingAmount));
            } else {
                ({ remainingAmount, cardBalanceUsed } = handleBalanceExpense(card, remainingAmount));
        
                if (remainingAmount > 0) {
                    ({ remainingAmount, rolloverUsed } = handleRolloverExpense(card, remainingAmount));  // 이월 금액 사용
        
                    if (remainingAmount > 0) {
                        ({ remainingAmount, teamFundUsed } = handleTeamFundExpense(card, remainingAmount));
                    }
                }
            }

            if (remainingAmount > 0) {
                throw new Error('잔액, 이월 금액 및 팀 운영비가 부족합니다.');
            }

            const transaction = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: transaction_amount - remainingAmount,
                transaction_type,
                deposit_type,
                expense_type,
                rolloverAmounted: rolloverUsed,
                teamFundDeducted: teamFundUsed,
            });

            console.log('신규 트랜잭션: ', transaction);
            
            await transaction.save();
            await card.save();

            res.status(201).json({
                message: '트랜잭션 처리 성공',
                transaction: transaction.toObject(),
                card: card.toObject(),
            });
        } else if (transaction_type === 'income') {
            let depositAmount = 0;

            if (deposit_type === 'RegularDeposit') {
                const maxLimit = card.limit || 100000;
                depositAmount = Math.min(maxLimit - card.balance, transaction_amount);
                card.balance += depositAmount;
            } else if (deposit_type === 'AdditionalDeposit' || deposit_type === 'TransportationExpense') {
                depositAmount = transaction_amount;
                card.balance += depositAmount;
            } else if (deposit_type === 'TeamFund') {
                depositAmount = transaction_amount;
                card.team_fund += depositAmount;
            }

            const transaction = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: depositAmount,
                transaction_type,
                deposit_type,
            });

            await transaction.save();
            await card.save();

            res.status(201).json({
                message: '트랜잭션 처리 성공',
                transaction: transaction.toObject(),
                card: card.toObject(),
            });
        } else {
            return res.status(400).json({ error: '유효하지 않은 거래 유형입니다.' });
        }
    } catch (error) {
        console.error('트랜잭션 생성 중 오류 발생:', error);
        res.status(500).json({ message: error.message || '서버 오류가 발생했습니다.', error });
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

//         const { merchant_name, menu_name, transaction_amount, transaction_date, transaction_type, expense_type } = req.body;

//         const sanitizedMerchantName = sanitizeInput(merchant_name);
//         const sanitizedMenuName = sanitizeInput(menu_name);

//         const updateData = {
//             ...(transaction_amount !== undefined && { transaction_amount }),
//             ...(transaction_date !== undefined && { transaction_date }),
//             ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
//             ...(sanitizedMenuName !== undefined && { menu_name: sanitizedMenuName }),
//             ...(expense_type !== undefined && { expense_type })
//         };

//         const transaction = await Transaction.findById(req.params.id);
//         if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

//         const card = await Card.findById(transaction.card_id);
//         if (!card) return res.status(404).json({ message: 'Card not found' });

//         const previousAmount = transaction.transaction_amount;
//         const newAmount = transaction_amount !== undefined ? Number(transaction_amount) : previousAmount;
//         const difference = newAmount - previousAmount;

//         const previousExpenseType = transaction.expense_type;
//         const isExpenseTypeChanged = expense_type && expense_type !== previousExpenseType;

//         if (transaction_type === 'expense') {
//             // (1) 이전 금액 복구 로직
//             if (previousExpenseType === 'TeamFund' && transaction.teamFundDeducted > 0) {
//                 card.team_fund += transaction.teamFundDeducted;
//             }
//             if (transaction.rolloverAmounted > 0) {
//                 card.rollover_amount += transaction.rolloverAmounted;
//             }
//             if (previousExpenseType === 'TeamCard') {
//                 card.balance += previousAmount;
//             }

//             // (2) 새로운 금액 차감 로직
//             let remainingAmount = newAmount;
//             let newTeamFundDeducted = 0;
//             let newRolloverAmounted = 0;

//             if (expense_type === 'TeamFund') {
//                 if (card.team_fund >= newAmount) {
//                     card.team_fund -= newAmount;
//                     newTeamFundDeducted = newAmount;
//                 } else {
//                     return res.status(400).json({ error: '팀 운영비 잔액이 부족합니다.' });
//                 }
//             } else if (expense_type === 'TeamCard') {
//                 if (card.balance >= newAmount) {
//                     card.balance -= newAmount;
//                 } else {
//                     remainingAmount = newAmount - card.balance;
//                     card.balance = 0;

//                     if (remainingAmount <= card.rollover_amount) {
//                         newRolloverAmounted = remainingAmount;
//                         card.rollover_amount -= remainingAmount;
//                     } else {
//                         remainingAmount -= card.rollover_amount;
//                         card.rollover_amount = 0;

//                         if (remainingAmount <= card.team_fund) {
//                             card.team_fund -= remainingAmount;
//                             newTeamFundDeducted = remainingAmount;
//                         } else {
//                             return res.status(400).json({ error: '잔액, 이월 금액 및 팀 운영비가 부족합니다.' });
//                         }
//                     }
//                 }
//             }

//             transaction.teamFundDeducted = newTeamFundDeducted;
//             transaction.rolloverAmounted = newRolloverAmounted;
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
        // const sanitizeInput = (input) => {
        //     return input ? input.replace(/[\u0000-\u001F\u007F]/g, '').trim() : undefined;
        // };

        const sanitizeInput = (input) => {
            return input === undefined || input === null ? undefined : input.replace(/[\u0000-\u001F\u007F]/g, '').trim();
        };

        const { merchant_name, menu_name, transaction_amount, transaction_date, transaction_type, expense_type } = req.body;

        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        const updateData = {
            ...(transaction_amount !== undefined && { transaction_amount }),
            ...(transaction_date !== undefined && { transaction_date }),
            ...(sanitizedMerchantName !== undefined && { merchant_name: sanitizedMerchantName }),
            ...(menu_name !== undefined && { menu_name: sanitizedMenuName !== undefined ? sanitizedMenuName : '' }),
            ...(expense_type !== undefined && { expense_type }),
        };

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        const card = await Card.findById(transaction.card_id);
        if (!card) return res.status(404).json({ message: 'Card not found' });

        const previousAmount = transaction.transaction_amount;
        const newAmount = transaction_amount !== undefined ? Number(transaction_amount) : previousAmount;
        const difference = newAmount - previousAmount;

        const previousExpenseType = transaction.expense_type;
        const isExpenseTypeChanged = expense_type && expense_type !== previousExpenseType;

        if (transaction_type === 'expense') {
            // (1) 이전 금액 복구 로직
            if (previousExpenseType === 'TeamFund' && transaction.teamFundDeducted > 0) {
                card.team_fund += transaction.teamFundDeducted;
            }

            if (transaction.rolloverAmounted > 0) {
                card.rollover_amount += transaction.rolloverAmounted;
            }

            if (previousExpenseType === 'TeamCard' || !isExpenseTypeChanged) {
                card.balance += previousAmount;
            }

            // (2) 새로운 금액 차감 로직
            let remainingAmount = newAmount;
            let newTeamFundDeducted = 0;
            let newRolloverAmounted = 0;

            if (expense_type === 'TeamFund') {
                if (card.team_fund >= newAmount) {
                    card.team_fund -= newAmount;
                    newTeamFundDeducted = newAmount;
                } else {
                    return res.status(400).json({ error: '팀 운영비 잔액이 부족합니다.' });
                }
            } else if (expense_type === 'TeamCard' || !expense_type) {
                if (card.balance >= newAmount) {
                    card.balance -= newAmount;
                } else {
                    remainingAmount = newAmount - card.balance;
                    card.balance = 0;

                    if (remainingAmount <= card.rollover_amount) {
                        newRolloverAmounted = remainingAmount;
                        card.rollover_amount -= remainingAmount;
                    } else {
                        remainingAmount -= card.rollover_amount;
                        card.rollover_amount = 0;

                        if (remainingAmount <= card.team_fund) {
                            card.team_fund -= remainingAmount;
                            newTeamFundDeducted = remainingAmount;
                        } else {
                            return res.status(400).json({ error: '잔액, 이월 금액 및 팀 운영비가 부족합니다.' });
                        }
                    }
                }
            }

            // 업데이트된 차감 데이터 저장
            transaction.teamFundDeducted = newTeamFundDeducted;
            transaction.rolloverAmounted = newRolloverAmounted;
        }

        // 카드 정보 저장
        await card.save();

        // 트랜잭션 업데이트
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });

        res.status(200).json({
            message: 'Transaction updated successfully',
            updatedTransaction,
            card: card.toObject(),
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Error updating transaction', error });
    }
};


// exports.deleteTransaction = async (req, res) => {
//     try {
//         // 삭제할 트랜잭션 찾기
//         const transaction = await Transaction.findById(req.params.id);
//         if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

//         const card = await Card.findById(transaction.card_id);
//         if (!card) return res.status(404).json({ message: 'Card not found' });

//         // 트랜잭션이 지출인 경우 복원 작업
//         if (transaction.transaction_type === 'expense') {
//             const transactionAmount = transaction.transaction_amount; // 삭제할 트랜잭션의 금액
//             const teamFundDeducted = transaction.teamFundDeducted; // 팀 펀드에서 차감된 금액
//             const rolloverAmountDeducted = transaction.rolloverAmounted; // 이월 금액에서 차감된 금액

//             // 기존의 지출 타입을 확인
//             const previousExpenseType = transaction.expense_type;

//             if (previousExpenseType === 'TeamFund') {
//                 // 팀펀드에서 지출한 경우
//                 card.team_fund += teamFundDeducted; // 팀펀드 복구
//                 card.rollover_amount += rolloverAmountDeducted; // 이월 금액 복구
//                 // console.log('팀 운영비 복구 완료!');
//                 // console.log('최종 팀 운영비:', card.team_fund);
//                 // console.log('최종 이월 금액:', card.rollover_amount);
//             } else {
//                 // 카드 잔액에서 지출한 경우
//                 const totalDeducted = teamFundDeducted + rolloverAmountDeducted; 
//                 card.balance += transactionAmount - totalDeducted; // 카드 잔액 복구
//                 card.balance = Math.max(card.balance, 0); // 카드 잔액은 음수가 되지 않도록 설정
//                 // console.log('카드 잔액 복구 완료!');
//                 // console.log('최종 카드 잔액:', card.balance);
//             }
//         }

//         await card.save(); // 업데이트된 카드 잔액 저장
//         await transaction.deleteOne(); // 트랜잭션 삭제

//         res.status(200).json({ message: 'Transaction deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting transaction:', error);
//         res.status(500).json({ message: 'Error deleting transaction', error });
//     }
// };

exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const card = await Card.findById(transaction.card_id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const previousAmount = transaction.transaction_amount;
        const previousExpenseType = transaction.expense_type;
        console.log('transaction', transaction);

        if (transaction.transaction_type === 'expense') {
            // **이월 금액 복구**
            if (transaction.rolloverAmounted > 0) {
                card.rollover_amount += transaction.rolloverAmounted;
                console.log('이월잔액 복구: ', card.rollover_amount);
            }

            // **팀 운영비 복구**
            if (previousExpenseType === 'TeamFund' && transaction.teamFundDeducted > 0) {
                card.team_fund += transaction.teamFundDeducted;
                console.log('팀운영비 복구: ', card.team_fund);
            }

            // **카드 잔액 복구** (잔액과 남은 금액만큼 복구)
            const remainingToRestore = previousAmount - (transaction.rolloverAmounted + transaction.teamFundDeducted);
            if (remainingToRestore > 0) {
                card.balance += remainingToRestore;
                console.log('카드잔액 복구: ', card.balance);
            }
        } else if (transaction.transaction_type === 'income') {
            if (transaction.deposit_type === 'TeamFund') {
                card.team_fund -= previousAmount; // 팀 운영비 입금 취소
            } else {
                card.balance -= previousAmount; // 일반 입금 취소
            }

            if (card.balance < 0 || card.team_fund < 0) {
                return res.status(400).json({
                    error: '잔액 또는 팀 운영비가 음수가 될 수 없습니다. 데이터 상태를 확인해주세요.',
                });
            }
        }

        // 카드 정보 저장
        await card.save();

        // 트랜잭션 삭제
        await transaction.deleteOne();

        res.status(200).json({
            message: 'Transaction deleted successfully',
            card: card.toObject(),
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
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