const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, phoneController.createPhone);
router.get('/:member_id', authMiddleware, phoneController.getPhones);
router.put('/:id', authMiddleware, phoneController.updatePhone);
router.delete('/:id', authMiddleware, phoneController.deletePhone);

module.exports = router;