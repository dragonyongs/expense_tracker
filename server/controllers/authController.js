const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Member = require('../models/Member');
const RefreshToken = require('../models/RefreshToken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokens = {};

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

// Login
// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         const member = await Member.findOne({ email });
//         if (!member || !(await bcrypt.compare(password, member.password))) {
//             return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
//         }
        
//         const accessToken = generateAccessToken(member);
//         const refreshToken = jwt.sign({ id: member._id }, refreshTokenSecret, { expiresIn: '1d' });
//         refreshTokens[refreshToken] = member._id;

//         setAccessTokenCookie(res, accessToken);

//         res.status(200).json({
//             user: {
//                 email: member.email,
//                 name: member.member_name,
//                 member_id: member._id,
//                 status_id: member.status_id,
//                 role_id: member.role_id,
//                 team_id: member.team_id
//             },
//             refreshToken
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        
        const member = await Member.findOne({ email });
        if (!member || !(await bcrypt.compare(password, member.password))) {
            return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

        const accessToken = generateAccessToken(member);
        const refreshToken = jwt.sign({ id: member._id }, refreshTokenSecret, { expiresIn: '1d' });

        // 리프레시 토큰을 데이터베이스에 저장
        const storedRefreshToken = new RefreshToken({
            member: member._id,
            token: refreshToken
        });
        await storedRefreshToken.save();

        // 액세스 토큰 쿠키 설정
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
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logout
// exports.logout = (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken || !(refreshToken in refreshTokens)) {
//         return res.status(401).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
//     }

//     // 리프레시 토큰 삭제
//     delete refreshTokens[refreshToken];

//     // 액세스 토큰 쿠키 삭제
//     res.clearCookie('accessToken', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         path: '/'
//     });

//     res.status(200).json({ message: '로그아웃되었습니다.' });
// };
// 로그아웃 시 리프레시 토큰 삭제
exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    // 리프레시 토큰이 없다면 오류 반환
    if (!refreshToken) {
        return res.status(400).json({ error: '리프레시 토큰이 필요합니다.' });
    }

    // 데이터베이스에서 리프레시 토큰 삭제
    await RefreshToken.deleteOne({ token: refreshToken });

    // 쿠키에서 액세스 토큰 삭제
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    res.status(200).json({ message: '로그아웃되었습니다.' });
};

// Refresh Access Token
// exports.refreshToken = async (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken || !(refreshToken in refreshTokens)) {
//         return res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
//     }

//     jwt.verify(refreshToken, refreshTokenSecret, async (err, decoded) => {
//         if (err) {
//             return res.status(403).json({ error: '리프레시 토큰 검증 실패' });
//         }

//         const member = await Member.findById(decoded.id);
//         if (!member) {
//             return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
//         }

//         const newAccessToken = generateAccessToken(member);
//         setAccessTokenCookie(res, newAccessToken);

//         res.status(200).json({ accessToken: newAccessToken });
//     });
// };

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    // 리프레시 토큰이 없다면 오류 반환
    if (!refreshToken) {
        return res.status(403).json({ error: '리프레시 토큰이 필요합니다.' });
    }

    // 데이터베이스에서 리프레시 토큰 찾기
    const storedRefreshToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedRefreshToken) {
        return res.status(403).json({ error: '유효하지 않은 리프레시 토큰입니다.' });
    }

    // 토큰 검증
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
