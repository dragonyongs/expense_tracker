const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new department
router.post('/', authMiddleware, departmentController.createDepartment);

// Get all departments
router.get('/', authMiddleware, departmentController.getAllDepartments);

// Get a department by ID
router.get('/:id', authMiddleware, departmentController.getDepartmentById);

// Update a department by ID
router.put('/:id', authMiddleware, departmentController.updateDepartment);

// Delete a department by ID
router.delete('/:id', authMiddleware, departmentController.deleteDepartment);

module.exports = router;
