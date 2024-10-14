const adminMiddleware = (req, res, next) => {
    const { role_id } = req.user; // 사용자의 role_id 가져오기

    // 관리자 권한 확인
    if (role_id.role_name !== 'super_admin' && role_id.role_name !== 'admin') {
        return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    next(); // 다음 미들웨어 또는 핸들러로 진행
};

module.exports = adminMiddleware;