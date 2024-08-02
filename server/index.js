const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://staradmin:StarRich@starconnect.294auud.mongodb.net/?retryWrites=true&w=majority&appName=starconnect', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.get('/api/data', (req, res) => {
    res.send({ message: 'Hello from Node.js!' });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
