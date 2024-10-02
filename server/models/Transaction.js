const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    transaction_date: { type: Date, required: true },
    merchant_name: { type: String, required: true },
    menu_name: { type: String },
    transaction_amount: { type: Number, required: true },
    transaction_type: { type: String, enum: ['지출', '입금'], required: true },
    deposit_type: { type: String, enum: ['정기 입금', '추가 입금'], required: true } // 입금 유형 추가
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;