const mongoose = require('mongoose');

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

module.exports = User;
