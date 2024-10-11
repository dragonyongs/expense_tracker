const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
    sex: { type: String, enum: ['man', 'woman'], required: true },
    faceColor: { type: String, required: true },
    earSize: { type: String, enum: ['small', 'big'], required: true },
    eyeStyle: { type: String, enum: ['circle', 'oval', 'smile'], required: true },
    noseStyle: { type: String, enum: ['short', 'long', 'round'], required: true },
    mouthStyle: { type: String, enum: ['laugh', 'smile', 'peace'], required: true },  // 수정된 부분
    shirtStyle: { type: String, enum: ['hoody', 'short', 'polo'], required: true },   // 수정된 부분
    glassesStyle: { type: String, enum: ['none', 'round', 'square'], required: true },
    hairColor: { type: String, required: true },
    hairStyle: { type: String, enum: ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort'], required: true }, // 수정된 부분
    hatStyle: { type: String, enum: ['none', 'beanie', 'turban'], required: true },  // 수정된 부분
    hatColor: { type: String, required: false },
    shirtColor: { type: String, required: true },
    bgColor: { type: String, required: true },
    member_id: { type: String, required: true }, // member_id는 String으로 유지
    // member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar;