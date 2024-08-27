const Transaction = require('../models/Transaction'); // 가정: 트랜잭션 모델을 불러옴

// Create a new transaction
exports.createTransaction = async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction', error });
    }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error });
    }
};

// Get a transaction by ID
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction', error });
    }
};

// Update a transaction by ID
exports.updateTransaction = async (req, res) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error });
    }
};

// Delete a transaction by ID
exports.deleteTransaction = async (req, res) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error });
    }
};

// Get transactions by year and month
exports.getTransactionsByYearAndMonth = async (req, res) => {
    try {
        const { year, month } = req.params;

        // 연도와 월로 필터링된 트랜잭션을 가져옴
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(`${year}-${month}-01`);
        endDate.setMonth(endDate.getMonth() + 1);

        // startDate ~ endDate 사이의 거래 내역을 찾음
        const transactions = await Transaction.find({
            transaction_date: {
                $gte: startDate,
                $lt: endDate
            }
        }).sort({ transaction_date: -1 }); // 최신순 정렬

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions by year and month', error });
    }
};
