const Avatar = require('../models/Avatar');

// 아바타 생성 또는 업데이트
const upsertAvatar = async (req, res) => {
    const { memberId } = req.params;

    try {
        // 해당 memberId로 아바타가 있는지 확인
        let avatar = await Avatar.findOne({ member_id: memberId });
        // console.log('현재 아바타:', avatar); // 아바타가 존재하는지 확인

        if (avatar) {
            // console.log('아바타 업데이트 시도:', req.body);

            // 아바타가 있으면 업데이트
            avatar = await Avatar.findOneAndUpdate({ member_id: memberId }, req.body, { new: true, runValidators: true });
            
            // console.log('업데이트된 아바타:', avatar); // 업데이트된 아바타 확인
            
            res.status(200).json(avatar);
        } else {
            // 아바타가 없으면 새로 생성, member_id 추가
            avatar = new Avatar({ member_id: memberId, ...req.body });
            await avatar.save();
            res.status(201).json(avatar);
        }

    } catch (error) {
        // 중복 키 에러 처리
        if (error.code === 11000) {
            return res.status(400).json({ error: '해당 사용자에 대한 아바타가 이미 존재합니다.' });
        }
        res.status(400).json({ error: error.message });
    }
};
// 아바타 가져오기
const getAvatarByMemberId = async (req, res) => {
    const { memberId } = req.params;
    try {
        const avatar = await Avatar.findOne({ member_id: memberId });
        // avatar가 없으면 빈 객체를 반환
        if (!avatar) {
            return res.status(200).json({}); // 404 대신 빈 객체 반환
        }
        res.status(200).json(avatar);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


module.exports = {
    upsertAvatar,
    getAvatarByMemberId
};
