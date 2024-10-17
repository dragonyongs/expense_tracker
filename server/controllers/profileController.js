const Profile = require('../models/Profile');
const Member = require('../models/Member');

exports.createProfile = async (req, res) => {
    try {
        // 데이터 검증 (예: member_id가 있는지 확인)
        if (!req.body.member_id) {
            return res.status(400).json({ message: 'member_id is required.' });
        }

        console.log('introduction', req.body.introduction);

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
    const memberId = req.params.member_id;
    console.log('memberID----', memberId);

    try {
        // 프로필 조회
        let profile = await Profile.findOne({ member_id: memberId })
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

        // 프로필이 존재하지 않는 경우 새로운 프로필 생성
        if (!profile) {
            const profileData = {
                member_id: memberID,
                avatar_id: null, // 기본값 설정
                introduction: '',
                phones: [],
                dates: [],
                addresses: []
            };

            // 새로운 프로필 생성
            profile = new Profile(profileData);
            await profile.save();

            // 생성된 프로필의 _id를 멤버 컬렉션에 업데이트
            await Member.findByIdAndUpdate(
                memberID,
                { profile_id: profile._id }, // profile_id 필드에 프로필 ID 저장
                { new: true } // 업데이트된 문서를 반환
            );

            return res.status(201).json(profile); // 새로 생성된 프로필 반환
        }

        res.status(200).json(profile); // 기존 프로필 반환
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params; // 프로필 ID를 받아옵니다

    console.log('Received profile data:', req.body);

    try {
        // 프로필 업데이트
        const updatedProfile = await Profile.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedProfile) {
            return res.status(404).json({ message: 'updateProfile: Profile not found' });
        }

        // 멤버의 profile_id가 null인 경우 업데이트
        const member = await Member.findOne({ _id: updatedProfile.member_id, profile_id: null });
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
