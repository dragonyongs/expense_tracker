const mongoose = require('mongoose');
const Member = require('./Member');  // 기존 멤버 스키마 불러오기

const memberSchema = new mongoose.Schema({
    member_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    rank: { type: String, default: null },
    position: { type: String, default: null },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
    entry_date: { type: Date, default: null },  // 입사일
    leave_date: { type: Date, default: null },  // 퇴사일
    hiatus_date: { type: Date, default: null }, // 휴직일
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;