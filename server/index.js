const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');

const app = express();

// CORS 설정
app.use(cors());

// MongoDB 연결
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://staradmin:StarRich@starconnect.294auud.mongodb.net/?retryWrites=true&w=majority&appName=starconnect';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// 모든 다른 경로를 index.html로 리디렉션
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// 포트 설정
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
