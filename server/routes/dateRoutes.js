const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');
const authMiddleware = require('../middlewares/authMiddleware');

// CRUD Routes
router.post('/', authMiddleware, dateController.createDate);
router.get('/:member_id', authMiddleware, dateController.getDates);
router.put('/:id', authMiddleware, dateController.updateDate);
router.delete('/:id', authMiddleware, dateController.deleteDate);

module.exports = router;