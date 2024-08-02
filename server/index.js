const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const app = express();

mongoose.connect('mongodb+srv://staradmin:StarRich@starconnect.294auud.mongodb.net/?retryWrites=true&w=majority&appName=starconnect', {
            serverSelectionTimeoutMS: 5000, // 타임아웃 시간 설정
            socketTimeoutMS: 45000, // 소켓 타임아웃 설정
        })
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));

app.use(express.json());

// API 경로 설정 - /api/data
app.get('/api/data', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});