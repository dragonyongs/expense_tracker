const Team = require('../models/Team');

// Create a new team
exports.createTeam = async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.status(201).json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('department_id').populate('account_ids');
        res.json(teams);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a team by ID
exports.getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('department_id').populate('account_ids');
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a team by ID
exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a team by ID
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
