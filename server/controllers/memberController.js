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
            .populate('status_id')  // 승인 상태를 함께 가져옴
            .populate('role_id')  // 역할 정보를 함께 가져옴
            .populate('team_id');  // 팀 정보를 함께 가져옴;
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a member by ID
exports.updateMember = async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
