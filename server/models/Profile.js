const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    phones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
    dates: { type: mongoose.Schema.Types.ObjectId, ref: 'Dates' },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }]
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;