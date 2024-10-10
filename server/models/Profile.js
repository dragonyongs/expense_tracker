const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true }, // Member와 연결
    phones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
    dates: { type: mongoose.Schema.Types.ObjectId, ref: 'Dates' },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
