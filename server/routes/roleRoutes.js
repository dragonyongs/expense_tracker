const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new role
router.post('/', authMiddleware, roleController.createRole);

// Get all roles
router.get('/', authMiddleware, roleController.getAllRoles);

// Get a role by ID
router.get('/:id', authMiddleware, roleController.getRoleById);

// Update a role by ID
router.put('/:id', authMiddleware, roleController.updateRole);

// Delete a role by ID
router.delete('/:id', authMiddleware, roleController.deleteRole);

module.exports = router;
