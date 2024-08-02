const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://staradmin:StarRich@starconnect.294auud.mongodb.net/?retryWrites=true&w=majority&appName=starconnect')
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.log(err));

app.use(express.json());

app.get('/api/data', (req, res) => {
    res.send({ message: 'Hello from Node.js!' });
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