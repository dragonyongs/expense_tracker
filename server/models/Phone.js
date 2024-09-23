const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    phone_type: { type: String, enum: ['personal_mobile', 'work_mobile', 'company_phone'], required: true }, // 전화 타입
    phone_number: { type: String, required: true },
    extension: { type: String, default: null }, // 내선 번호 (회사 전화일 경우)
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Phone = mongoose.model('Phone', phoneSchema);

module.exports = Phone;
