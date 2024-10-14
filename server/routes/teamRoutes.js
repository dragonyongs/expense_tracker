const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new team
router.post('/', authMiddleware, teamController.createTeam);

// Get all teams
router.get('/', authMiddleware, teamController.getAllTeams);

// Get a team by ID
router.get('/:id', authMiddleware, teamController.getTeamById);

// Update a team by ID
router.put('/:id', authMiddleware, teamController.updateTeam);

// Delete a team by ID
router.delete('/:id', authMiddleware, teamController.deleteTeam);

module.exports = router;
