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

        // 2. 연락처 저장
        const savedPhone = await newPhone.save();

        // 3. 프로필 조회
        let profile = await Profile.findOne({ member_id });

        // 4. 프로필이 존재하지 않으면 새로 생성
        if (!profile) {
            profile = new Profile({
                member_id,
                phones: [] // 초기에는 빈 배열
            });
        }

        // 5. 프로필에 연락처 ID 추가
        profile.phones.push(savedPhone._id);
        await profile.save();

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
        // 연락처 업데이트
        const updatedPhone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log("updatedPhone:", updatedPhone);
        
        if (!updatedPhone) return res.status(404).json({ message: 'Phone not found' });

        const profile = await Profile.findOne({ phones: req.params.id });
        if (profile) {
            profile.phones = profile.phones.map(phoneId =>
                phoneId.toString() === req.params.id ? updatedPhone._id : phoneId
            );
            await profile.save();
            console.log('Profile updated:', profile); // 중복된 로그 방지
        }

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