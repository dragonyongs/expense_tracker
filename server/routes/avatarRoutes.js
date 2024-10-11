const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');

router.put('/:memberId', avatarController.upsertAvatar); // 아바타 생성 및 업데이트 통합
router.get('/:memberId', avatarController.getAvatarByMemberId);

module.exports = router;