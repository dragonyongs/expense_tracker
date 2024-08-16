const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    card_number: { type: String, required: true, unique: true },
    initial_limit: { type: Number, required: true },
    current_limit: { type: Number, required: true },
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // 카드가 속한 계좌 참조
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }        // 카드 소유자 참조
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;