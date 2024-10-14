const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new Status
router.post('/', authMiddleware, statusController.createStatus);

// Get all Status
router.get('/', authMiddleware, statusController.getAllStatuses);

// Get a Status by ID
router.get('/:id', authMiddleware, statusController.getStatusById);

// Update a Status by ID
router.put('/:id', authMiddleware, statusController.updateStatus);

// Delete a Status by ID
router.delete('/:id', authMiddleware, statusController.deleteStatus);

module.exports = router;
