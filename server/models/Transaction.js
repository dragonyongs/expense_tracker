const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    transaction_date: { type: Date, required: true },
    merchant_name: { type: String, required: true },
    menu_name: { type: String },
    transaction_amount: { type: Number, required: true },
    transaction_type: { type: String, enum: ['expense', 'income'], required: true },
    deposit_type: { 
        type: String, 
        enum: ['RegularDeposit', 'TransportationExpense', 'TeamFund', 'AdditionalDeposit'], 
        required: function() {
            return this.transaction_type === 'income'; // deposit일 경우에만 필수
        }
    },
    expense_type: { type: String, enum: ['RegularExpense', 'TeamCard', 'TeamFund'] },
    rolloverAmounted: { type: Number, default: 0 },
    teamFundDeducted: { type: Number, default: 0 }, // 추가된 부분
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
