
require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRotes = require('./routes/authRotes');
const memberRoutes = require('./routes/memberRoutes');
const teamRoutes = require('./routes/teamRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const cardRoutes = require('./routes/cardRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const statusRoutes = require('./routes/statusRoutes');
const roleRoutes = require('./routes/roleRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const dateRoutes = require('./routes/dateRoutes');
const addressRoutes = require('./routes/addressRoutes');
const profileRoutes = require('./routes/profileRoutes');
const avatarRoutes = require('./routes/avatarRoutes');

const app = express();
app.use(cookieParser());

// Middleware
app.use(bodyParser.json());

// CORS 설정
app.use(cors({ origin: 'https://expense-tracker-mhnw.onrender.com/', credentials: true }));

// Routes
app.use('/api/auth', authRotes);
app.use('/api/members', memberRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/dates', dateRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/avatars', avatarRoutes);

// MongoDB 연결
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MONGO_URI 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
}

mongoose.connect(mongoURI, {
    waitQueueTimeoutMS: 10000, // 필요에 따라 조정
    serverSelectionTimeoutMS: 20000, // 타임아웃 시간 설정 (20초)
    socketTimeoutMS: 45000, // 소켓 타임아웃 설정 (45초)
    connectTimeoutMS: 30000, // 연결 타임아웃 설정 (30초)
    minPoolSize: 5, // 필요에 따라 조정
    maxPoolSize: 20, // 최대 연결 풀 크기 설정
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, '../client/dist')));

// 모든 나머지 요청은 클라이언트 측 애플리케이션으로 리다이렉트
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 포트 설정
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
