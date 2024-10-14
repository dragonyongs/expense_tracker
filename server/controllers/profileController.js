const Profile = require('../models/Profile');
const Member = require('../models/Member');

exports.createProfile = async (req, res) => {
    try {
        const profileData = {
            member_id: req.body.member_id,
            avatar_id: req.body.avatar_id, // 아바타 ID 추가
            phones: req.body.phones || [],
            dates: req.body.dates || [],
            addresses: req.body.addresses || []
        };
        
        // 새로운 프로필 생성
        const newProfile = new Profile(profileData);
        await newProfile.save();

        // 생성된 프로필의 _id를 멤버 컬렉션에 업데이트
        await Member.findByIdAndUpdate(
            req.body.member_id,
            { profile_id: newProfile._id }, // profile_id 필드에 프로필 ID 저장
            { new: true } // 업데이트된 문서를 반환
        );

        // 응답으로 새로 생성된 프로필 반환
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 멤버의 연락처 목록 조회
exports.getProfiles = async (req, res) => {
    try {
        const profile = await Profile.find()
            .populate('phones');
            // .populate('addresses')
            // .populate('dates');
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfileById = async (req, res) => {
    const memberID = req.params.member_id;

    try {
        const profile = await Profile.findOne({ member_id: memberID})
            .populate('phones')
            .populate('avatar_id')
            .populate('member_id');
            // .populate('addresses')
            // .populate('dates');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params; // 프로필 ID를 받아옵니다
    
    try {
        // 프로필 업데이트
        const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedProfile) {
            return res.status(404).json({ message: 'updateProfile: Profile not found' });
        }

        // 멤버의 profile_id가 null인 경우 업데이트
        const member = await Member.findOne({ profile_id: null, _id: updatedProfile.member_id });
        if (member) {
            await Member.findByIdAndUpdate(
                member._id,
                { profile_id: updatedProfile._id }, // profile_id 필드에 프로필 ID 저장
                { new: true } // 업데이트된 문서를 반환
            );
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProfile= async (req, res) => {
    try {
        res.status(201).json('deleteProfile');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
