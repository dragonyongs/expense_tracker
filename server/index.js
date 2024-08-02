const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://staradmin:StarRich@starconnect.294auud.mongodb.net/?retryWrites=true&w=majority&appName=starconnect')
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));

app.use(express.json());

// User 스키마 및 모델 정의
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    roles: { type: [String], default: [] },
    company: { type: String, default: '' },
    officePhones: { type: [String], default: [] },
    workPhones: { type: [String], default: [] },
    extensionNumbers: { type: [String], default: [] },
    hireDate: { type: Date },
    corporateCards: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    accessToken: { type: String },
    refreshToken: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

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