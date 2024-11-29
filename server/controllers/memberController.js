const bcrypt = require("bcrypt");
const Member = require('../models/Member');
const Profile = require('../models/Profile');
const Status = require('../models/Status');
const Role = require('../models/Role');

// const mongoose = require('mongoose');

// Create a new member
// exports.createMember = async (req, res) => {
//     try {
//         const { member_name, password, email } = req.body;
//         if (!member_name || !password || !email) {
//             return res.status(400).json({ error: '이름, 비밀번호, 이메일은 필수 입력 사항입니다.' });
//         }

//         const existingUser = await Member.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
//         }

//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         // 새로운 멤버 생성
//         const newMember = await Member.create({
//             member_name,
//             password: hashedPassword,
//             email,
//         });

//         // 빈 프로필 생성
//         const profileData = {
//             member_id: newMember._id, // 방금 생성된 멤버의 ID
//             avatar_id: null, // 기본 아바타 ID 또는 null
//             phones: [], // 빈 배열로 초기화
//             dates: [],
//             addresses: []
//         };

//         const newProfile = await Profile.create(profileData); // 새 프로필 저장

//         // 생성된 프로필의 ID를 멤버 컬렉션에 업데이트
//         await Member.findByIdAndUpdate(
//             newMember._id,
//             { profile_id: newProfile._id }, // profile_id 필드에 프로필 ID 저장
//             { new: true } // 업데이트된 문서를 반환
//         );

//         console.log(newMember);
//         res.status(201).json({ member: newMember, profile: newProfile }); // 멤버와 프로필 정보 반환
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

exports.createMember = async (req, res) => {
    try {
        const { member_name, password, email, status_id, role_id, team_id, position, rank } = req.body;  

        // 필수 입력값 검증
        if (!member_name || !password || !email) {
            return res.status(400).json({ error: '이름, 비밀번호, 이메일은 필수 입력 사항입니다.' });
        }

        // 이메일 중복 확인
        const existingUser = await Member.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
        }

        // 비밀번호 해싱
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let statusId = status_id;
        if (!statusId) {
            const pendingStatus = await Status.findOne({ status_name: 'pending' });
            if (pendingStatus) {
                statusId = pendingStatus._id;
            }
        }

        let roleId = role_id;
        if (!roleId) {
            const userRole = await Role.findOne({ role_name: '사용자' });
            if (userRole) {
                roleId = userRole._id;
            }
        }

        // 새로운 멤버 생성
        const newMember = await Member.create({
            member_name,
            password: hashedPassword,
            email,
            status_id: statusId,
            role_id: roleId,
            team_id,
            position,
            rank
        });

        // 빈 프로필 생성
        const profileData = {
            member_id: newMember._id,
            avatar_id: null,
            phones: [],
            dates: [],
            addresses: []
        };

        const newProfile = await Profile.create(profileData); // 새 프로필 저장

        // 생성된 프로필의 ID를 멤버 컬렉션에 업데이트
        await Member.findByIdAndUpdate(
            newMember._id,
            { profile_id: newProfile._id },
            { new: true }
        );

        res.status(201).json({ member: newMember, profile: newProfile }); // 멤버와 프로필 정보 반환
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
            .populate('profile_id');

        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a member by ID
// exports.updateMember = async (req, res) => {
//     try {
//         const { password, ...otherData } = req.body;  // 새 비밀번호를 분리

//         let updateMemberData = { ...otherData };  // 나머지 데이터는 그대로 처리

//         // 사용자가 새로운 비밀번호를 입력한 경우만 처리
//         if (password) {
//             const saltRounds = 10;
//             const hashedPassword = await bcrypt.hash(password, saltRounds);
//             updateMemberData.password = hashedPassword;  // 해시된 비밀번호로 덮어쓰기
//         } else {
//             // 비밀번호가 없으면 기존 비밀번호를 유지
//             const existingMember = await Member.findById(req.params.id);
//             if (!existingMember) return res.status(404).json({ error: 'Member not found' });

//             // 비밀번호 필드를 업데이트에서 제외
//             updateMemberData.password = existingMember.password;
//         }

//         // DB 업데이트
//         const member = await Member.findByIdAndUpdate(req.params.id, updateMemberData, { new: true });
//         if (!member) return res.status(404).json({ error: 'Member not found' });

//         res.json(member);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

exports.updateMember = async (req, res) => {
    try {
        const { password, status_id, ...otherData } = req.body;  // 상태값도 포함

        let updateMemberData = { ...otherData };  // 나머지 데이터는 그대로 처리

        // 비밀번호 업데이트 처리
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateMemberData.password = hashedPassword;  // 해시된 비밀번호로 덮어쓰기
        } else {
            // 비밀번호가 없으면 기존 비밀번호를 유지
            const existingMember = await Member.findById(req.params.id);
            if (!existingMember) return res.status(404).json({ error: 'Member not found' });

            // 비밀번호 필드를 업데이트에서 제외
            updateMemberData.password = existingMember.password;
        }

        // 상태값 업데이트 (만약 전달된 상태가 있다면)
        if (status_id) {
            updateMemberData.status_id = status_id;
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
