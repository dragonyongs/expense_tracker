const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Member = require('../models/Member');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokens = {}; // Store refresh tokens safely

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const member = await Member.findOne({ email });
        if (!member) {
            return res.status(401).json({ error: '존재하지 않는 이메일입니다.' });
        }

        const isMatch = await bcrypt.compare(password, member.password);
        if (!isMatch) {
            return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
        }

        const accessToken = jwt.sign({ id: member._id, email: member.email, name: member.member_name }, accessTokenSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: member._id }, refreshTokenSecret, { expiresIn: '1d' });

        refreshTokens[refreshToken] = member._id;

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        res.status(200).json({
            user: { email: member.email, name: member.member_name },  // 사용자 정보를 반환
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logout
exports.logout = (req, res) => {
    console.log('Call logout!');
    const refreshToken = req.body.refreshToken;
    if (refreshToken in refreshTokens) {
        delete refreshTokens[refreshToken];
        res.clearCookie('accessToken');
        res.status(200).json({ message: '로그아웃되었습니다.' });
    } else {
        res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
    }
};

// Refresh Access Token
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !(refreshToken in refreshTokens)) {
        return res.status(403).json({ error: '리프레시 토큰이 유효하지 않습니다.' });
    }

    jwt.verify(refreshToken, refreshTokenSecret, (err, member) => {
        if (err) {
            return res.status(403).json({ error: '리프레시 토큰이 유효하지 않습니다.' });
        }

        const accessToken = jwt.sign({ id: member.id }, accessTokenSecret, { expiresIn: '1h' });
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
        res.status(200).json({ accessToken });
    });
};

// Check if user is authenticated
exports.isAuthenticated = (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, accessTokenSecret, (err, member) => {
        if (err) {
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }
        
        res.status(200).json({ user: member });  // 사용자 정보를 직접 반환
    });
};

// 토큰 갱신 (리프레시 토큰을 이용하여 새로운 액세스 토큰 발급)
exports.refreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
        return res.status(403).json({ error: '리프레시 토큰이 필요합니다.' });
    }

    if (!(refreshToken in refreshTokens)) {
        return res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
    }

    jwt.verify(refreshToken, refreshTokenSecret, (err, member) => {
        if (err) {
            return res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
        }

        const accessToken = jwt.sign({ id: member.id, email: member.email }, accessTokenSecret, { expiresIn: '1h' });
        res.cookie('accessToken', accessToken, { httpOnly: true });
        res.status(200).json({ accessToken });
    });
};