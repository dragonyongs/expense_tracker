const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    team_name: { type: String, required: true },
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;