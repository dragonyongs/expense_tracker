const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new account
router.post('/', authMiddleware, accountController.createAccount);

// Get all accounts
router.get('/', authMiddleware, accountController.getAllAccounts);

// Get an account With cards
router.get('/accountsWithCards', authMiddleware, accountController.getAccountsAndCards);

// Get an Member Accounts with cards
router.get('/memberAccountsWithCards/:id', authMiddleware, accountController.getMemberAccountsAndCards);

// Get an account by ID
router.get('/:id', authMiddleware, accountController.getAccountById);

// Update an account by ID
router.put('/:id', authMiddleware, accountController.updateAccount);

// Delete an account by ID
router.delete('/:id', authMiddleware, accountController.deleteAccount);

module.exports = router;
