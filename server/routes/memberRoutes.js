const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Create a new member
router.post('/', memberController.createMember);

// Get all members
router.get('/', memberController.getAllMembers);

// Get a member by ID
router.get('/:id', memberController.getMemberById);

// Update a member by ID
router.put('/:id', memberController.updateMember);

// Delete a member by ID
router.delete('/:id', memberController.deleteMember);

module.exports = router;