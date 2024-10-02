const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    card_number: { type: String, required: true, unique: true },
    limit: { type: Number, default: 100000, required: true },  // 매월 카드 한도, 기본값 10만원
    rollover_amount: { type: Number, default: 0 },  // 이월 금액
    balance: { type: Number, default: 0 },  // 현재 잔액
    team_fund: { type: Number, default: 0 },  // 팀 운영비 (팀장 카드에만 해당)
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },  // 카드가 속한 계좌 참조
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },  // 카드 소유자 참조
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
