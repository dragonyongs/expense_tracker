const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role_name: { type: String, required: true, unique: true },  // 역할 이름
    role_description: { type: String, default: '' },  // 역할 설명
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
