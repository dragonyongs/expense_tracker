
// 환경 변수 로드
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const memberRoutes = require('./routes/memberRoutes');
const teamRoutes = require('./routes/teamRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const cardRoutes = require('./routes/cardRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// CORS 설정
app.use(cors());

// Routes
app.use('/api/members', memberRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// MongoDB 연결
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 30000, // 타임아웃 시간 설정 (30초)
    socketTimeoutMS: 45000, // 소켓 타임아웃 설정 (45초)
    connectTimeoutMS: 30000, // 연결 타임아웃 설정 (30초)
    maxPoolSize: 10, // 최대 연결 풀 크기 설정
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.use(express.json());

// 포트 설정
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
