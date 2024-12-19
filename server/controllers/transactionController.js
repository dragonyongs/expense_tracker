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

        return res.status(200).json(transactions || []);
    } catch (error) {
        return res.status(500).json({ error: "트랜잭션 조회 중 오류가 발생했습니다." });
    }
};


exports.createTransaction = async (req, res) => {
    const { 
        card_id, 
        transaction_date, 
        merchant_name, 
        menu_name, 
        transaction_amount, 
        transaction_type, 
        deposit_type,
        expense_card,
        expense_type,
        is_deducted,
    } = req.body;


    if (!card_id || !transaction_date || !transaction_amount || !transaction_type || !merchant_name || !menu_name) {
        return res.status(400).json({ error: '필수 값이 누락되었습니다.' });
    }
    
    if (transaction_type === "expense" && !expense_type) {
        return res.status(400).json({ error: '지출 거래 시 expense_type과 is_deducted 값이 필요합니다.' });
    }
    
    if (transaction_type === "income" && !deposit_type) {
        return res.status(400).json({ error: '수입 거래 시 deposit_type 값이 필요합니다.' });
    }
    
    if (Number.isNaN(Number(transaction_amount)) || transaction_amount <= 0) {
        return res.status(400).json({ error: '유효한 금액(transaction_amount)을 입력해야 합니다.' });
    }

    // 금액 차감 공통 함수
    function subtractFromSource(card, source, amount) {
        const usedAmount = Math.min(card[source], amount);
        card[source] -= usedAmount;
        return { remainingAmount: amount - usedAmount, usedAmount };
    }

    const handleTeamFundExpense = (card, amount) => subtractFromSource(card, 'team_fund', amount);
    const handleRolloverExpense = (card, amount) => subtractFromSource(card, 'rollover_amount', amount);

    const handleExpense = (card, expenseType, amount) => {
        let remainingAmount = amount;
        let teamFundDeducted = 0;
        let rolloverAmounted = 0;
    
        switch (expenseType) {
            case 'TeamFund': {
                const result = handleTeamFundExpense(card, remainingAmount);
                remainingAmount = result.remainingAmount;
                teamFundDeducted = result.usedAmount;
                break;
            }
            case 'RegularExpense': {
                const balanceResult = subtractFromSource(card, 'balance', remainingAmount);
                remainingAmount = balanceResult.remainingAmount;
                
                if (remainingAmount > 0) {
                    const rolloverResult = handleRolloverExpense(card, remainingAmount);
                    remainingAmount = rolloverResult.remainingAmount;
                    rolloverAmounted = rolloverResult.usedAmount;
    
                    if (remainingAmount > 0) {
                        const teamFundResult = handleTeamFundExpense(card, remainingAmount);
                        remainingAmount = teamFundResult.remainingAmount;
                        teamFundDeducted = teamFundResult.usedAmount;
                    }
                }
                break;
            }
            default: {
                throw new Error(`알 수 없는 지출 유형: ${expenseType}`);
            }
        }
    
        return { remainingAmount, teamFundDeducted, rolloverAmounted };
    };

    // const sanitizeInput = (input) => input?.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    const sanitizeInput = (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[\u0000-\u001F\u007F]/g, '') // 제어 문자 제거
            .replace(/[<>]/g, '') // 태그 제거
            .trim();
    };
    
    try {
        const sanitizedMerchantName = sanitizeInput(merchant_name);
        const sanitizedMenuName = sanitizeInput(menu_name);

        const card = await Card.findById(card_id);
        if (!card) {
            return res.status(404).json({ error: '카드를 찾을 수 없습니다.' });
        }

        card.team_fund = card.team_fund || 0;
        card.balance = card.balance || 0;
        card.rollover_amount = card.rollover_amount || 0;

        let remainingAmount = Number(transaction_amount);

        const saveTransactionAndCard = async (transactionData, card) => {
            const transaction = new Transaction(transactionData);
            await transaction.save();
            await card.save();
            return transaction;
        };
        
        if (transaction_type === "expense" || is_deducted) {
            const {
                remainingAmount: finalRemaining,
                teamFundDeducted,
                rolloverAmounted,
            } = handleExpense(card, expense_type, remainingAmount);
        
            if (finalRemaining > 0) {
                throw new Error('잔액, 이월 금액 및 팀 운영비가 부족합니다.');
            }
        
            const transactionData = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: transaction_amount - finalRemaining,
                transaction_type,
                expense_card,
                expense_type,
                teamFundDeducted,
                rolloverAmounted,
                is_deducted,
            });

            const transaction = await saveTransactionAndCard(transactionData, card);
        
            res.status(201).json({
                message: '트랜잭션 처리 성공',
                transaction: transaction.toObject(),
                card: card.toObject(),
            });
        } else if (transaction_type === 'income') {
            let depositAmount = transaction_amount;

            if (deposit_type === 'RegularDeposit') {
                const maxLimit = card.limit || 100000;
                depositAmount = Math.min(maxLimit - card.balance, depositAmount);
            }

            if (`deposit_type` === 'TeamFund') {
                card.team_fund += depositAmount;
            } else {
                card.balance += depositAmount;
            }

            const transaction = new Transaction({
                card_id,
                transaction_date,
                merchant_name: sanitizedMerchantName,
                menu_name: sanitizedMenuName,
                transaction_amount: depositAmount,
                transaction_type,
                deposit_type,
                is_deducted: false, // 차감 아님
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

exports.updateTransaction = async (req, res) => {
    try {
        const sanitizeInput = (input) => 
            input === undefined || input === null ? undefined : input.replace(/[\u0000-\u001F\u007F]/g, '').trim();

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
            // 금액이나 유형 변경이 없는 경우 복구/차감 로직을 건너뜀
            if (transaction_amount === undefined && !isExpenseTypeChanged) {
                // 단순 상점명, 메뉴명 수정
                console.log('No amount or expense type change detected, skipping balance updates.');
            } else {
                // (1) 이전 금액 복구 로직
                if (previousExpenseType === 'TeamFund' && transaction.teamFundDeducted > 0) {
                    card.team_fund += transaction.teamFundDeducted;
                }
        
                if (transaction.rolloverAmounted > 0) {
                    card.rollover_amount += transaction.rolloverAmounted;
                }
        
                if (previousExpenseType === 'RegularExpense' || !isExpenseTypeChanged) {
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
                } else if (expense_type === 'RegularExpense' || !expense_type) {
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
        }

        // 금액 변경이 없는 경우: 단순 상점명, 메뉴명 등 수정
        if (
            transaction_type === 'expense' &&
            transaction_amount === undefined &&
            !isExpenseTypeChanged
        ) {
            // 기존 금액 관련 데이터는 변경하지 않음
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


exports.getAllDeposits = async (req, res) => {
    try {
        const deposits = await Transaction.find({ $or: [
            { transaction_type: "income" }, 
            { transaction_type: "expense", is_deducted: true }
        ] }).populate('card_id');

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

exports.getFilteredDeposits = async (req, res) => {
    try {
        const { year, month } = req.params;

        // 기본 쿼리 조건
        let query = { 
            $or: [
                { transaction_type: "income" }, 
                { transaction_type: "expense", is_deducted: true }
            ]
        };

        // 날짜 필터 추가
        if (year) {
            const start = new Date(year, month ? month - 1 : 0, 1);
            const end = new Date(year, month ? month : 12, 1);
            end.setMonth(end.getMonth() + 1); // 끝 날짜를 다음 달 1일로 설정

            query.transaction_date = { $gte: start, $lt: end }; // 날짜 범위 필터
        }

        const deposits = await Transaction.find(query).populate('card_id');

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
};

// exports.getSearchKeyword = async (req, res) => {
//     const { keyword } = req.params;

//     let query = { 
//         merchant_name: { $regex: keyword, $options: 'i' } 
//     };

//     try {
//         const transactions = await Transaction.find(query).limit(10);
//         res.status(200).json(transactions);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: '서버 에러' });
//     }
// }

// exports.getMenuForMerchant = async (req, res) => {
//     const { merchant_name } = req.params;
//     let query = { 
//         merchant_name: merchant_name
//     };

//     try {
//         const menus = await Transaction.find(query).distinct('menu_name');
//         console.log(menus);
//         res.status(200).json(menus);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: '서버 에러' });
//     }
// }


exports.getSearchKeyword = async (req, res) => {
    const { keyword } = req.params;

    // 키워드가 포함된 상호명을 찾기 위한 쿼리
    let query = { 
        merchant_name: { $regex: keyword, $options: 'i' } 
    };

    try {
        const transactions = await Transaction.find(query);

        // 결과가 없을 경우 처리
        if (transactions.length === 0) {
            return res.status(200).json([]); // 빈 배열 반환
        }

        // 상호명과 그 빈도를 카운트
        const merchantCount = transactions.reduce((acc, transaction) => {
            acc[transaction.merchant_name] = (acc[transaction.merchant_name] || 0) + 1;
            return acc;
        }, {});


        // 빈도가 높은 순서로 정렬하여 결과 배열 생성
        const uniqueMerchants = Object.keys(merchantCount)
            .sort((a, b) => merchantCount[b] - merchantCount[a])
            .slice(0, 10); // 상위 10개 결과만

        res.status(200).json(uniqueMerchants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러' });
    }
}


// exports.getMenuForMerchant = async (req, res) => {
//     const { merchant_name } = req.params;

//     // 선택한 상호명에 대해 메뉴를 찾기 위한 쿼리
//     let query = { 
//         merchant_name: merchant_name
//     };

//     try {
//         const menus = await Transaction.find(query);

//         // 메뉴와 그 빈도를 카운트
//         const menuCount = menus.reduce((acc, menu) => {
//             acc[menu.menu_name] = (acc[menu.menu_name] || 0) + 1;
//             return acc;
//         }, {});

//         // 빈도가 높은 순서로 정렬하여 결과 배열 생성
//         const uniqueMenus = Object.keys(menuCount)
//             .sort((a, b) => menuCount[b] - menuCount[a]);

//         res.status(200).json(uniqueMenus);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: '서버 에러' });
//     }
// }

exports.getMenuForMerchant = async (req, res) => {
    const { merchant_name } = req.params;

    let query = { 
        merchant_name: merchant_name
    };

    try {
        const menus = await Transaction.find(query);

        const menuCount = menus.reduce((acc, menu) => {
            if (!acc[menu.menu_name]) {
                acc[menu.menu_name] = {
                    menu_name: menu.menu_name,
                    transaction_amount: menu.transaction_amount,
                    count: 0
                };
            }
            acc[menu.menu_name].count += 1;
            return acc;
        }, {});

        const uniqueMenus = Object.values(menuCount)
            .sort((a, b) => b.count - a.count);

        res.status(200).json(uniqueMenus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 에러' });
    }
}
