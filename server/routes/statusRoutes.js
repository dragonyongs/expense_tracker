const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

// Create a new Status
router.post('/', statusController.createStatus);

// Get all Status
router.get('/', statusController.getAllStatuses);

// Get a Status by ID
router.get('/:id', statusController.getStatusById);

// Update a Status by ID
router.put('/:id', statusController.updateStatus);

// Delete a Status by ID
router.delete('/:id', statusController.deleteStatus);

module.exports = router;
