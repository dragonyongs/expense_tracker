const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// 새로운 카드 생성
router.post('/', cardController.createCard);

// 전체 카드 조회
router.get('/', cardController.getAllCards);

// 카드 번호로 조회
router.get('/:id', cardController.getCardById);

// 사용자 member_id로 카드 목록 조회
router.get('/member/:memberId', cardController.getCardsByMemberId);

// 카드 정보 업데이트
router.put('/:id', cardController.updateCard);

// 카드 삭제
router.delete('/:id', cardController.deleteCard);

module.exports = router;
