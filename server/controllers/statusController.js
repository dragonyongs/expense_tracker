const Status = require('../models/Status');

// Create a new Status
exports.createStatus = async (req, res) => {
    try {
        const status = new Status(req.body);
        await status.save();
        res.status(201).json(status);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get all Status
exports.getAllStatuses = async (req, res) => {
    try {
        const status = await Status.find();
        res.json(status);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a Status by ID
exports.getStatusById = async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json(status);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a Status by ID
exports.updateStatus = async (req, res) => {
    try {
        const status = await Status.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json(status);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a Status by ID
exports.deleteStatus = async (req, res) => {
    try {
        const status = await Status.findByIdAndDelete(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status not found' });
        res.json({ message: 'Status deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};