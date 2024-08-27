const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get transactions by year and month
router.get('/:year/:month', transactionController.getTransactionsByYearAndMonth);

// Get a transaction by ID
router.get('/:id', transactionController.getTransactionById);

// Update a transaction by ID
router.put('/:id', transactionController.updateTransaction);

// Delete a transaction by ID
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
