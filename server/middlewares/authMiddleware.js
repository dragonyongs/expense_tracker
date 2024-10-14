const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        console.log('Token is missing');
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        console.log('Token verification failed:', error); // 디버깅용 로그
        return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }
};

module.exports = authMiddleware;
