const bcrypt = require("bcrypt");
const Member = require('../models/Member');

// Create a new member
exports.createMember = async (req, res) => {
    try {
        const { member_name, password, email } = req.body;
        if (!member_name || !password || !email) {
            return res.status(400).json({ error: '이름, 비밀번호, 이메일은 필수 입력 사항입니다.' });
        }

        const existingUser = await Member.findOne({ email });
        if (existingUser){
            return res.status(409).json({ error: '이미 사용 중인 이메일입니다. '});
        }

        const slatRounds = 10;
        const hashedPassword = await bcrypt.hash(password, slatRounds);

        const newMember = await Member.create({
            member_name,
            password: hashedPassword,
            email
        });

        res.status(201).json(newMember);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all members
exports.getAllMembers = async (req, res) => {
    try {
        const members = await Member.find()
            .populate('status_id')
            .populate('team_id')
            .populate('role_id')
            .populate('card_ids');
        res.json(members);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get a member by ID
exports.getMemberById = async (req, res) => {
    try {
        const member = await Member.findById(req.params.id)
            .populate('status_id')
            .populate('role_id')
            .populate('team_id')
            .populate('card_ids');
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a member by ID
exports.updateMember = async (req, res) => {
    try {
        const { newPassword, ...otherData } = req.body;  // 새 비밀번호를 분리

        let updateMemberData = { ...otherData };  // 나머지 데이터는 그대로 처리

        // 사용자가 새로운 비밀번호를 입력한 경우만 처리
        if (newPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            updateMemberData.password = hashedPassword;  // 해시된 비밀번호로 덮어쓰기
        } else {
            // 새 비밀번호가 없으면 기존 비밀번호 유지
            const existingMember = await Member.findById(req.params.id);
            if (!existingMember) return res.status(404).json({ error: 'Member not found' });

            updateMemberData.password = existingMember.password;  // 기존 해시된 비밀번호 유지
        }

        // DB 업데이트
        const member = await Member.findByIdAndUpdate(req.params.id, updateMemberData, { new: true });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a member by ID
exports.deleteMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
