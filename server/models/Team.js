const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // 본부 참조
    account_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }], // 팀이 사용하는 계좌들 참조
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;