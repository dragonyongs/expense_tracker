const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all roles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a Role by ID
exports.getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a role by ID
exports.updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a role by ID
exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json({ message: 'Role deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};