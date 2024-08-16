const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }, // 트랜잭션이 일어난 카드 참조
    transaction_date: { type: Date, required: true },
    merchant: { type: String, required: true },
    menu_name: { type: String, required: true },
    amount: { type: Number, required: true }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;