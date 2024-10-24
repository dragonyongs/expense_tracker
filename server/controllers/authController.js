const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Member = require('../models/Member');
const RefreshToken = require('../models/RefreshToken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Helper function: Generate Access Token
const generateAccessToken = (member) => {
    return jwt.sign({
        member_id: member._id,
        email: member.email,
        name: member.member_name,
        status_id: member.status_id,
        role_id: member.role_id,
        team_id: member.team_id
    }, accessTokenSecret, { expiresIn: '1h' });
};

// Helper function: Set Access Token in Cookie
const setAccessTokenCookie = (res, token) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 1000 // 1시간
    });
};

// Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const member = await Member.findOne({ email });
        if (!member || !(await bcrypt.compare(password, member.password))) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        const accessToken = generateAccessToken(member);
        const refreshToken = jwt.sign({ id: member._id }, refreshTokenSecret, { expiresIn: '1d' });

        // Save the refresh token in the database
        const storedRefreshToken = new RefreshToken({
            member: member._id,
            token: refreshToken
        });
        await storedRefreshToken.save();

        // Set the access token as a cookie
        setAccessTokenCookie(res, accessToken);

        res.status(200).json({
            user: {
                email: member.email,
                name: member.member_name,
                member_id: member._id,
                status_id: member.status_id,
                role_id: member.role_id,
                team_id: member.team_id
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logout Controller
exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    // Check if refresh token is provided
    if (!refreshToken) {
        return res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
    }

    try {
        // Find and delete the refresh token from the database
        const deleteResult = await RefreshToken.deleteOne({ token: refreshToken });

        // Check if the token was successfully deleted
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ error: '삭제할 리프레시 토큰을 찾을 수 없습니다.' });
        }

        // Clear the access token cookie

        // 쿠키 삭제 전 로그 확인
        console.log('Clearing accessToken cookie...');
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        console.log('Cookie cleared');


        res.status(200).json({ message: '로그아웃되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Refresh Token Controller
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    // Check if refresh token is provided
    if (!refreshToken) {
        return res.status(403).json({ error: '리프레시 토큰이 필요합니다.' });
    }

    // Find the refresh token in the database
    const storedRefreshToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedRefreshToken) {
        return res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, refreshTokenSecret, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: '리프레시 토큰 검증 실패' });
        }

        const member = await Member.findById(decoded.id);
        if (!member) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        const newAccessToken = generateAccessToken(member);
        setAccessTokenCookie(res, newAccessToken);

        res.status(200).json({ accessToken: newAccessToken });
    });
};

// Check if user is authenticated
exports.isAuthenticated = (req, res) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, accessTokenSecret, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
        }

        const member = await Member.findById(decoded.member_id);
        if (!member) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }

        res.status(200).json({
            user: {
                email: member.email,
                name: member.member_name,
                status_id: member.status_id,
                role_id: member.role_id,
                member_id: member._id,
                team_id: member.team_id
            }
        });
    });
};