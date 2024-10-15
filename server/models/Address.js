const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address_type: { 
        type: String, 
        enum: ['home', 'work', 'delivery'], 
        required: true 
    }, // 주소 타입 (예: 집주소, 회사주소, 배송지)
    address_name: { type: String }, // 배송지명 (예: 우주스페이스)
    address_line1: { type: String, required: true }, // 기본 주소 (예: 서울시 강남구 강남대로62길 23)
    address_line2: { type: String, default: '' }, // 선택적 세부 주소 (예: 역삼빌딩 3층)
    postal_code: { type: String }, // 우편번호
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;