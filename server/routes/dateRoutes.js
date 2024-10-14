const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

// CRUD Routes
router.post('/', dateController.createDate);
router.get('/:member_id', dateController.getDates);
router.put('/:id', dateController.updateDate);
router.delete('/:id', dateController.deleteDate);

module.exports = router;