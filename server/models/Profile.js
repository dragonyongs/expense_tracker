const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, 
    phones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
    dates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Date' }],
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    avatar_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar', default: null } // 아바타 참조 추가
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;