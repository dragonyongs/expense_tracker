const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    account_number: { type: String, required: true, unique: true },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null } // 계좌가 속한 팀 참조
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;