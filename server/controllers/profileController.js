const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
    try {
        res.status(201).json('createProfile');
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
        const profile = await Profile.find({ member_id: memberID})
            .populate('phones');
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
    try {
        res.status(201).json('updateProfile');
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
