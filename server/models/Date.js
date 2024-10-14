const mongoose = require('mongoose');

const datesSchema = new mongoose.Schema({
    date_type: { type: String, enum: ['entry', 'leave', 'hiatus', 'birthday'], required: true },
    date: { type: Date, default: null },
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Dates = mongoose.model('Date', datesSchema);

module.exports = Dates;
