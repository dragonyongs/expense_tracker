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
        console.log('savedPhone:', savedPhone); // 저장된 연락처 확인

        // 3. 프로필 조회
        let profile = await Profile.findOne({ member_id });

        // 4. 프로필이 없는 경우 새로운 프로필 생성
        if (!profile) {
            profile = new Profile({
                member_id,
                phones: [] // 초기에는 빈 배열
            });
        }

        // 5. 연락처 ID가 이미 존재하지 않는 경우에만 추가
        if (!profile.phones.some(phoneId => phoneId.toString() === savedPhone._id.toString())) {
            profile.phones.push(savedPhone._id);
        }

        // 6. 프로필 저장
        await profile.save();
        console.log('Profile saved:', profile);

        // 7. 프로필 저장 후 다시 한 번 확인 (populate 사용)
        const updatedProfile = await Profile.findOne({ member_id }).populate('phones');
        console.log('Updated profile with populated phones:', updatedProfile);

        // 8. 생성된 연락처 반환
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