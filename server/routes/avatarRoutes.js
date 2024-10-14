const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');
const authMiddleware = require('../middlewares/authMiddleware');

router.put('/:memberId', authMiddleware, avatarController.upsertAvatar); // 아바타 생성 및 업데이트 통합
router.get('/:memberId', authMiddleware, avatarController.getAvatarByMemberId);

module.exports = router;