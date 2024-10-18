const Phone = require('../models/Phone');
const Profile = require('../models/Profile');

// 연락처 생성 및 프로필에 추가
exports.createPhone = async (req, res) => {
    try {
        const { member_id, phone_type, phone_number, extension } = req.body;

        const newPhone = new Phone({
            member_id,
            phone_type,
            phone_number,
            extension
        });

        const savedPhone = await newPhone.save();
        console.log('savedPhone:', savedPhone); // 저장된 연락처 확인

        let profile = await Profile.findOne({ member_id });

        if (!profile.phones.some(phoneId => phoneId.toString() === savedPhone._id.toString())) {
            profile.phones.push(savedPhone._id);
        }

        await profile.save();

        res.status(201).json(savedPhone);
    } catch (error) {
        console.error('Error creating phone:', error);
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
        // 연락처 업데이트
        const updatedPhone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPhone) return res.status(404).json({ message: 'Phone not found' });

        // 프로필에서 해당 연락처 ID를 찾아서 업데이트
        const profile = await Profile.findOne({ phones: req.params.id });
        if (profile) {
            // phones 배열에서 해당 연락처 ID를 찾아 업데이트된 연락처로 교체
            profile.phones = profile.phones.map(phoneId =>
                phoneId.toString() === req.params.id ? updatedPhone._id : phoneId
            );

            console.log('Profile before saving:', profile);
            await profile.save(); // 프로필 저장
            console.log('Profile after saving:', profile);
        } else {
            console.log('Profile not found for the phone ID.');
        }

        res.status(200).json(updatedPhone);
    } catch (error) {
        console.error('Error updating phone:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a phone contact by ID
exports.deletePhone = async (req, res) => {
    try {
        // 1. 연락처 삭제
        const deletedPhone = await Phone.findByIdAndDelete(req.params.id);
        if (!deletedPhone) return res.status(404).json({ message: 'Phone not found' });

        // 2. 프로필에서 삭제된 연락처 ID 제거
        const profile = await Profile.findOne({ phones: req.params.id });
        if (profile) {
            profile.phones = profile.phones.filter(phoneId => phoneId.toString() !== req.params.id);
            await profile.save();
        }

        res.status(200).json({ message: 'Phone deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};