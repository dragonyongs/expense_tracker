const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    phones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
    dates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Date' }],
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, 
    avatar_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar', default: null },
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;