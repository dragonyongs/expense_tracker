const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// 새로운 트랜잭션 생성 (지출/입급)
router.post('/', authMiddleware, transactionController.createTransaction);

// 모든 트랜잭션 조회
router.get('/', authMiddleware, transactionController.getAllTransactions);

// 전체 트랜잭션 검색 API
router.get('/search/all/:keyword', authMiddleware, transactionController.getAllTransactionsByKeyword);

// 키워드 조회
router.get('/search/:merchant_name', authMiddleware, transactionController.getSearchKeyword);
router.get('/search/menu/:merchant_name', authMiddleware, transactionController.getMenuForMerchant);

// 입금 트랜잭션 조회
router.get('/deposits', authMiddleware, transactionController.getAllDeposits);
router.get('/deposits/:year/:month?', authMiddleware, transactionController.getFilteredDeposits);

// 카드별 트랜잭션 조회
router.get('/card/:cardId', authMiddleware, transactionController.getCardTransactions);

// Get transactions by year and month
router.get('/:year/:month', authMiddleware, transactionController.getTransactionsByYearAndMonth);

// Get a transaction by ID
router.get('/:id', authMiddleware, transactionController.getTransactionById);

// Update a transaction by ID
router.put('/:id', authMiddleware, transactionController.updateTransaction);

// Delete a transaction by ID
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;
