const Avatar = require('../models/Avatar');

// 아바타 생성 또는 업데이트
const upsertAvatar = async (req, res) => {
    const { memberId } = req.params;
    // console.log(memberId);
    try {
        // 해당 memberId로 아바타가 있는지 확인
        let avatar = await Avatar.findOne({ member_id: memberId });

        if (avatar) {
            // 아바타가 있으면 업데이트
            avatar = await Avatar.findOneAndUpdate({ member_id: memberId }, req.body, { new: true, runValidators: true });
            res.status(200).json(avatar);
        } else {
            // 아바타가 없으면 새로 생성, member_id 추가
            avatar = new Avatar({ member_id: memberId, ...req.body });
            await avatar.save();
            res.status(201).json(avatar);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 아바타 가져오기
const getAvatarByMemberId = async (req, res) => {
    const { memberId } = req.params;

    try {
        const avatar = await Avatar.findOne({ member_id: memberId });
        if (!avatar) {
            return res.status(404).json({ error: 'Avatar not found' });
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
