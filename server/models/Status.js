const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    status_name: { type: String, required: true, unique: true },  // 승인 상태 이름 (예: pending, approved)
    status_description: { type: String, default: '' },  // 승인 상태 설명
});

const Status = mongoose.model('Status', statusSchema);

module.exports = Status;
