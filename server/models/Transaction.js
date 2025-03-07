const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    deposit_type: { 
        type: String, 
        enum: ['RegularDeposit', 'TransportationDeposit', 'TeamFund', 'AdditionalDeposit'], // TeamFund > TeamFundDeposit으로 변경해야함 (기존 데이터)
        required: function() {
            const parent = this.ownerDocument();
            return parent?.transaction_type === 'income';
        }
    },
    name: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    // 새 필드: 메뉴별 지출 사용자와 이체 여부
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberId', required: true },
    is_transfer: { type: Boolean, default: false }
});

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    // 새 필드: 거래를 기록한 지출자(본인)
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberId', required: true },
    transaction_date: { type: Date, required: true },
    merchant_name: { type: String, required: true },
    menu_name: { type: String },
    menu_items: [menuItemSchema],
    transaction_amount: { type: Number, required: true },
    transaction_type: { type: String, enum: ['expense', 'income'], required: true },
    expense_card: { 
        type: String, 
        enum: ['TeamCard', 'OvertimeMealCard'], // 현재는 팀카드만 사용
        default: 'TeamCard',
        required: function() {
            return this.transaction_type === 'expense';
        }
    },
    expense_type: { 
        type: String, 
        enum: ['RegularExpense', 'TeamFund', 'TransportationExpense', 'OvertimeMealExpense'], // 목적만 구분
        default: 'RegularExpense',
        required: function() {
            return this.transaction_type === 'expense';
        }
    },
    rolloverAmounted: { type: Number, default: 0 },
    teamFundDeducted: { type: Number, default: 0 },
    is_deducted: { type: Boolean, default: false },
}, { timestamps: true });

transactionSchema.pre('save', function(next) {
    if (this.menu_items && this.menu_items.length > 0) {
        this.transaction_amount = this.menu_items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    next();
});

transactionSchema.pre('validate', function(next) {
    if (this.transaction_type === 'income' && this.menu_items) {
        for (const item of this.menu_items) {
            if (!item.deposit_type) {
                return next(new Error(`deposit_type is required for income transactions`));
            }
        }
    }
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;