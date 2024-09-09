const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    card_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },  // 카드 참조
    transaction_date: { type: Date, required: true },  // 트랜잭션 날짜
    merchant_name: { type: String, required: true },  // 가맹점 이름 (입금 시 '관리자 입금' 등)
    menu_name: { type: String },  // 메뉴 또는 상품 이름 (입금 시 '잔액 충전' 등)
    transaction_amount: { type: Number, required: true },  // 트랜잭션 금액
    transaction_type: { type: String, enum: ['지출', '입금'], required: true }  // 트랜잭션 타입 (입금 또는 지출)
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
