const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new member
router.post('/', memberController.createMember);

// Get all members
router.get('/', authMiddleware, memberController.getAllMembers);

// Get a member by ID
router.get('/:id', authMiddleware, memberController.getMemberById);

// Update a member by ID
router.put('/:id', authMiddleware, memberController.updateMember);

// Delete a member by ID
router.delete('/:id', authMiddleware, memberController.deleteMember);

module.exports = router;