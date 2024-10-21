const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',  // Member 모델과 연관
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d' // 1일 후 자동 삭제 (만료 시간 설정)
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);