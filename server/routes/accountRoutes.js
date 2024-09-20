const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new account
router.post('/', accountController.createAccount);

// Get all accounts
router.get('/', accountController.getAllAccounts);

// Get an account With cards
router.get('/accountsWithCards', accountController.getAccountsAndCards);

// Get an Member Accounts with cards
router.get('/memberAccountsWithCards', authMiddleware, accountController.getMemberAccountsAndCards);

// Get an account by ID
router.get('/:id', accountController.getAccountById);

// Update an account by ID
router.put('/:id', accountController.updateAccount);

// Delete an account by ID
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
