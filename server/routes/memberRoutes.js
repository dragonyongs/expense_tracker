const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', memberController.createMember); // 멤버 생성

router.get('/backup', authMiddleware, memberController.backupMembers); // 멤버 백업

router.get('/email', authMiddleware, memberController.getMemberByEmail); // 이메일로 멤버 검색

router.get('/', authMiddleware, memberController.getAllMembers); // 모든 멤버 조회

router.get('/filteredMembers', authMiddleware, memberController.getFilteredMembers); // 필터링된 멤버 조회

router.post('/:id/reset-password', authMiddleware, memberController.resetPassword);

router.get('/:id', authMiddleware, memberController.getMemberById); // 특정 멤버 조회

router.put('/:id', authMiddleware, memberController.updateMember); // 멤버 수정

router.delete('/:id', authMiddleware, memberController.deleteMember); // 멤버 삭제

module.exports = router;
