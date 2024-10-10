const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');

// CRUD Routes
router.post('/', phoneController.createPhone);
router.get('/:member_id', phoneController.getPhones);
router.put('/:id', phoneController.updatePhone);
router.delete('/:id', phoneController.deletePhone);

module.exports = router;