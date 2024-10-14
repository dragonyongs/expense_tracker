const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

// 새로운 카드 생성
router.post('/', authMiddleware, cardController.createCard);

// 전체 카드 조회
router.get('/', authMiddleware, cardController.getAllCards);

// 카드 번호로 조회
router.get('/:id', authMiddleware, cardController.getCardById);

// 사용자 member_id로 카드 목록 조회
router.get('/member/:memberId', authMiddleware, cardController.getCardsByMemberId);

// 카드 정보 업데이트
router.put('/:id', authMiddleware, cardController.updateCard);

// 카드 삭제
router.delete('/:id', authMiddleware, cardController.deleteCard);

module.exports = router;
