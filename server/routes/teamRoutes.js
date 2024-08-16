const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Create a new team
router.post('/', teamController.createTeam);

// Get all teams
router.get('/', teamController.getAllTeams);

// Get a team by ID
router.get('/:id', teamController.getTeamById);

// Update a team by ID
router.put('/:id', teamController.updateTeam);

// Delete a team by ID
router.delete('/:id', teamController.deleteTeam);

module.exports = router;
