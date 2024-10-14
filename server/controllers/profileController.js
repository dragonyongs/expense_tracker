const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
    try {
        const profileData = {
            member_id: req.body.member_id,
            avatar_id: req.body.avatar_id, // 아바타 ID 추가
            phones: req.body.phones || [],
            dates: req.body.dates || [],
            addresses: req.body.addresses || []
        };
        
        const newProfile = new Profile(profileData);
        await newProfile.save();
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
    // console.log('Profile ID:', id);
    
    try {
        const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedProfile) {
            return res.status(404).json({ message: 'updateProfile: Profile not found' });
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
