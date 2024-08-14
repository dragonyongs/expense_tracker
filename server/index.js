
// 환경 변수 로드
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();

// CORS 설정
app.use(cors());

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

// API 경로 설정 - /api/data
app.get('/api/data', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: err.message });
    }
});

// 포트 설정
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
