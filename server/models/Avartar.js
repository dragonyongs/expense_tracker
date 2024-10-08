const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
    sex: { type: String, enum: ['man', 'woman'], required: true },
    faceColor: { type: String, required: true },
    earSize: { type: String, enum: ['small', 'big'], required: true },
    eyeStyle: { type: String, enum: ['circle', 'oval', 'smile'], required: true },
    noseStyle: { type: String, enum: ['short', 'long', 'round'], required: true },
    mouthStyle: { type: String, enum: ['smile', 'sad', 'peace'], required: true },
    shirtStyle: { type: String, enum: ['polo', 'hoodie', 'short'], required: true },
    glassesStyle: { type: String, enum: ['none', 'round', 'square'], required: true },
    hairColor: { type: String, required: true },
    hairStyle: { type: String, required: true },
    hatStyle: { type: String, enum: ['none', 'beanie', 'turban'], required: true },
    hatColor: { type: String, required: false },
    eyeBrowStyle: { type: String, enum: ['up', 'down'], required: true },
    shirtColor: { type: String, required: true },
    bgColor: { type: String, required: true },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar;