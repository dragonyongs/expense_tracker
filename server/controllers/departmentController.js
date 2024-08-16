const Department = require('../models/Department');

// Create a new department
exports.createDepartment = async (req, res) => {
    try {
        const department = new Department(req.body);
        await department.save();
        res.status(201).json(department);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json(department);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a department by ID
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json(department);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a department by ID
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
