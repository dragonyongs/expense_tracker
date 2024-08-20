const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// 로그인 경로
router.post('/login', authController.login);

// 로그아웃 경로
router.post('/logout', authController.logout);

// 토큰 갱신 경로
router.post('/refresh-token', authController.refreshToken);

// 인증 상태 확인 경로
router.get('/isAuthenticated', authController.isAuthenticated);

module.exports = router;
