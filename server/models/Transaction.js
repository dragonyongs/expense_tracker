const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    transaction_date: { type: Date, required: true },
    merchant_name: { type: String, required: true },
    menu_name: { type: String, required: true },
    transaction_amount: { type: Number, required: true }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;