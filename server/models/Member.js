const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    member_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    approval_status: { type: String, enum: ['pending', 'approved'], default: 'pending' }, // 승인 상태
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }, // 팀 참조
    card_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }], // 사용자가 소유한 카드들 참조
    position: { type: String, default: null }, // 직급
    role: { type: String, default: null }      // 직책
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
