const mongoose = require('mongoose');

const datesSchema = new mongoose.Schema({
    entry_date: { type: Date, default: null },  // 입사일
    leave_date: { type: Date, default: null },  // 퇴사일
    hiatus_date: { type: Date, default: null }, // 휴직일
    member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true } // 멤버 참조
}, { timestamps: true });

const Dates = mongoose.model('Dates', datesSchema);

module.exports = Dates;
