const Phone = require('../models/Phone');
const Profile = require('../models/Profile');

// 연락처 생성 및 프로필에 추가
exports.createPhone = async (req, res) => {
    try {
        const { member_id, phone_type, phone_number, extension } = req.body;

        // 1. 새 연락처 생성
        const newPhone = new Phone({
            member_id,
            phone_type,
            phone_number,
            extension
        });

        console.log('newPhone', newPhone)

        const savedPhone = await newPhone.save();
        res.status(201).json(savedPhone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 멤버의 연락처 목록 조회
exports.getPhones = async (req, res) => {
    try {
        const phones = await Phone.find({ member_id: req.params.member_id });
        res.status(200).json(phones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a phone contact by ID
exports.updatePhone = async (req, res) => {
    try {
        const updatedPhone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPhone) return res.status(404).json({ message: 'Phone not found' });
        res.status(200).json(updatedPhone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a phone contact by ID
exports.deletePhone = async (req, res) => {
    try {
        const deletedPhone = await Phone.findByIdAndDelete(req.params.id);
        if (!deletedPhone) return res.status(404).json({ message: 'Phone not found' });
        res.status(200).json({ message: 'Phone deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};