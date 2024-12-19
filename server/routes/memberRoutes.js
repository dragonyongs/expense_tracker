const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', memberController.createMember);

router.get('/backup', authMiddleware, memberController.backupMembers);

router.get('/email', authMiddleware, memberController.getMemberByEmail);

router.get('/', authMiddleware, memberController.getAllMembers);

router.get('/filteredMembers', authMiddleware, memberController.getFilteredMembers);

router.get('/:id', authMiddleware, memberController.getMemberById);

router.put('/:id', authMiddleware, memberController.updateMember);

router.delete('/:id', authMiddleware, memberController.deleteMember);

module.exports = router;