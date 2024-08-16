const Account = require('../models/Account');

// Create a new account
exports.createAccount = async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all accounts
exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().populate('team_id');
        res.json(accounts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get an account by ID
exports.getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).populate('team_id');
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update an account by ID
exports.updateAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json(account);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete an account by ID
exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.params.id);
        if (!account) return res.status(404).json({ error: 'Account not found' });
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
