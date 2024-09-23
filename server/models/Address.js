const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address_type: { type: String, enum: ['home', 'work', 'delivery'], required: true }, // 주소 타입
    address_line1: { type: String, required: true },
    address_line2: { type: String, default: '' }, // 선택적 세부 주소
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
