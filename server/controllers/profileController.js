const Profile = require('../models/Profile');
const Member = require('../models/Member');

exports.createProfile = async (req, res) => {
    try {
        // 데이터 검증 (예: member_id가 있는지 확인)
        if (!req.body.member_id) {
            return res.status(400).json({ message: 'member_id is required.' });
        }

        const profileData = {
            member_id: req.body.member_id,
            avatar_id: req.body.avatar_id || null, // 기본값 설정
            introduction: req.body.introduction || '',
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
            .populate({
                path: 'member_id',
                select: 'member_name email team_id role_id status_id rank position',
                populate: {
                    path: 'team_id', // 팀 정보를 가져오기 위해 추가
                    select: 'team_name department_id' // 가져오고 싶은 팀 필드
                }
            })
            .populate('phones', 'phone_type phone_number extension')
            .populate('addresses', 'address_type address_name address_line1 address_line2 postal_code')
            .populate('dates', 'date_type date')
            .populate('avatar_id');
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfileById = async (req, res) => {
    const member_id = req.params.member_id;

    try {
        // 프로필 조회
        let profile = await Profile.findOne({ member_id: member_id })
            .populate('phones', 'phone_type phone_number extension')
            .populate('avatar_id')
            .populate({
                path: 'member_id',
                select: 'member_name email team_id role_id status_id rank position',
                populate: {
                    path: 'team_id',
                    select: 'team_name'
                }
            })
            .populate('addresses', 'address_type address_name address_line1 address_line2 postal_code')
            .populate('dates', 'date_type date');

        res.status(200).json(profile); // 기존 프로필 반환
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params; // 프로필 ID

    try {
        // 프로필 업데이트
        const updatedProfile = await Profile.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
                context: 'query' // Validator가 query context에서 작동하도록 설정
            }
        );

        if (!updatedProfile) {
            console.log('No profile found with the given ID');
            return res.status(404).json({ message: 'Profile not found' });
        }

        // member_id가 null이 아닌 경우에만 멤버 업데이트
        if (updatedProfile.member_id) {
            const member = await Member.findById(updatedProfile.member_id);
            if (member && !member.profile_id) {
                await Member.findByIdAndUpdate(
                    member._id,
                    { profile_id: updatedProfile._id },
                    { new: true }
                );
            }
        }

        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: 'Failed to update profile', error: error.message });
    }
};

exports.deleteProfile= async (req, res) => {
    try {
        res.status(201).json('deleteProfile');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
