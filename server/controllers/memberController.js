const bcrypt = require("bcrypt");
const Member = require('../models/Member');
const Profile = require('../models/Profile');
const Status = require('../models/Status');
const Role = require('../models/Role');
const xlsx = require('xlsx');
const { generateRandomPassword } = require('../utils/generateRandomPassword'); // 랜덤 비밀번호 생성 유틸리티

exports.createMember = async (req, res) => {
    try {
        const { member_name, password, email, status_id, role_id, team_id, position, rank, is_admin_created, is_password_reset } = req.body;
        
        // 필수 입력값 검증
        if (!member_name || !email) {
            return res.status(400).json({ error: '이름, 비밀번호, 이메일은 필수 입력 사항입니다.' });
        }

        // 이메일 중복 확인
        const existingUser = await Member.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
        }

        // 랜덤 비밀번호 생성
        const randomPassword = generateRandomPassword();

        // 비밀번호 해싱
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash( !password ? randomPassword : password, saltRounds);


        let statusId = status_id || (await Status.findOne({ status_name: 'pending' }))._id;
        console.log('statusId', statusId);
        let roleId = role_id || (await Role.findOne({ role_name: '사용자' }))._id;

        // 새로운 멤버 생성
        const newMember = await Member.create({
            member_name,
            password: hashedPassword,
            email,
            status_id: statusId,
            role_id: roleId,
            team_id,
            position,
            rank,
            is_admin_created,
            is_password_reset
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
        // 모든 멤버 조회 및 관계 데이터 로드
        const members = await Member.find()
            .populate('status_id', 'status_name')
            .populate('team_id', 'team_name')
            .populate('role_id', 'role_name')
            .lean();

        res.json(members); // 퇴사자나 관리자 제외 없이 전체 멤버 반환
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getMemberByEmail = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: '이메일을 제공해야 합니다.' });
    }

    try {
        // 이메일로 멤버 검색
        const member = await Member.findOne({ email }).lean();

        if (!member) {
            // 멤버가 없는 경우 명확한 응답 반환
            return res.json({ found: false });
        }

        // 멤버가 있는 경우
        res.json({ found: true, member });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFilteredMembers = async (req, res) => {
    try {
        // 모든 멤버 조회 및 관계 데이터 로드
        const members = await Member.find()
            .populate('status_id', 'status_name')
            .populate('team_id', 'team_name')
            .populate('role_id', 'role_name')
            .lean();

        // 퇴사자 및 관리자 제외
        const filteredMembers = members.filter(member => {
            const isResigned = member.status_id?.status_name === 'resigned';
            const isSuperAdmin = member.role_id?.role_name === 'super_admin';
            return !isResigned && !isSuperAdmin; // 퇴사자 및 관리자는 제외
        });

        res.json(filteredMembers); // 필터링된 멤버들만 반환
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

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, is_password_reset } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const member = await Member.findByIdAndUpdate(
            id,
            { password: hashedPassword, is_password_reset },
            { new: true }
        );

        if (!member) return res.status(404).json({ error: 'Member not found' });

        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 비밀번호 변경
exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // 현재 비밀번호 확인
        const member = await Member.findById(id);
        if (!member) return res.status(404).json({ error: 'Member not found' });

        // 현재 비밀번호가 맞는지 확인
        const isPasswordMatch = await bcrypt.compare(currentPassword, member.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
        }

        // 새 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 비밀번호 변경
        member.password = hashedPassword;
        await member.save();

        res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { password, status_id, ...otherData } = req.body;  // 상태값도 포함

        let updateMemberData = { ...otherData };  // 나머지 데이터는 그대로 처리

        // 비밀번호 업데이트 처리
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateMemberData.password = hashedPassword;

            // 비밀번호 변경 시 초기화 플래그 설정
            if (req.body.is_password_reset !== undefined) {
                updateMemberData.is_password_reset = req.body.is_password_reset;
            }
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

// exports.backupMembers = async (req, res) => {
//     try {
//         // 모든 멤버 조회 및 관계 데이터 로드
//         const members = await Member.find()
//             .populate('status_id')
//             .populate('team_id')
//             .populate('role_id')
//             .lean();

//         // 데이터를 엑셀 파일로 변환할 준비
//         const data = [];

//         // 멤버 데이터를 순회하면서 프로필 데이터를 가져오기
//         for (const member of members) {
//             // 프로필 정보 조회
//             const profile = await Profile.findOne({ member_id: member._id })
//                 .populate('phones')
//                 .populate('addresses')
//                 .populate('dates')
//                 .lean();

//             // 데이터 객체 생성
//             const row = {
//                 _id: member._id.toString(), // 멤버의 _id는 항상 포함
//                 이름: member.member_name,
//                 이메일: member.email,
//                 비밀번호: member.password,
//                 직급: member.rank,
//                 직책: member.position,
//                 상태: member?.status_id ? member.status_id.status_description : '미승인',
//                 팀: member?.team_id?.team_name || null,
//                 생성일: member.createdAt,
//                 수정일: member.updatedAt,
//                 전화번호: profile?.phones && profile.phones.length > 0 
//                     ? profile.phones.map(phone => 
//                         `${phone.phone_type}: ${phone.phone_number}${phone.extension ? ` (${phone.extension})` : ''}`).join(', ') 
//                     : '없음',
//                 주소: profile?.addresses && profile.addresses.length > 0 
//                     ? profile.addresses.map(address => `${address.address_type}: ${address.address_line1} ${address.address_line2} (${address.postal_code})`).join(', ') 
//                     : '없음',
//                 기념일: profile?.dates && profile.dates.length > 0 
//                     ? profile.dates.map(date => `${date.date_type}: ${new Date(date.date).toLocaleDateString()}`).join(', ') 
//                     : '없음',
//                 소개: profile?.introduction || ''
//             };

//             // 데이터 배열에 추가
//             data.push(row);
//         }

//         // 워크북 생성
//         const worksheet = xlsx.utils.json_to_sheet(data);
//         const workbook = xlsx.utils.book_new();
//         xlsx.utils.book_append_sheet(workbook, worksheet, 'Members');

//         // 파일 저장
//         const filePath = `members_export_${Date.now()}.xlsx`;
//         xlsx.writeFile(workbook, filePath);

//         // 파일 다운로드
//         res.download(filePath, (err) => {
//             if (err) {
//                 console.error(err);
//                 res.status(500).json({ error: 'File download error' });
//             }
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// };

exports.backupMembers = async (req, res) => {
    try {
        // 모든 멤버 조회 및 관계 데이터 로드
        const members = await Member.find()
            .populate('status_id')
            .populate('team_id')
            .populate('role_id')
            .lean();

        // 데이터를 엑셀 파일로 변환할 준비
        const data = [];

        // 멤버 데이터를 순회하면서 프로필 데이터를 가져오기
        for (const member of members) {
            // 프로필 정보 조회
            const profile = await Profile.findOne({ member_id: member._id })
                .populate('phones')
                .populate('addresses')
                .populate('dates')
                .lean();

            // 데이터 객체 생성
            const row = {
                _id: member._id.toString(),
                이름: member.member_name,
                이메일: member.email,
                비밀번호: member.password,
                직급: member.rank,
                직책: member.position,
                상태: member?.status_id ? member.status_id.status_description : '미승인',
                팀: member?.team_id?.team_name || null,
                생성일: member.createdAt,
                수정일: member.updatedAt,
                전화번호: profile?.phones && profile.phones.length > 0 
                    ? profile.phones.map(phone => 
                        `${phone.phone_name}: ${phone.phone_number}${phone.extension ? ` (${phone.extension})` : ''}`).join(', ') 
                    : '없음',
                주소: profile?.addresses && profile.addresses.length > 0 
                    ? profile.addresses.map(address => `${address.address_name}: ${address.address_line1} / ${address.address_line2} (${address.postal_code})`).join(', ') 
                    : '없음',
                기념일: profile?.dates && profile.dates.length > 0 
                    ? profile.dates.map(date => `${date.date_name}: ${new Date(date.date).toLocaleDateString()}`).join(', ') 
                    : '없음',
                소개: profile?.introduction || ''
            };

            // 데이터 배열에 추가
            data.push(row);
        }

        // 워크북 생성
        const worksheet = xlsx.utils.json_to_sheet(data);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Members');

        // 엑셀 파일을 메모리 버퍼로 생성
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // 현재 날짜와 시간을 포맷팅
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD 형식
        const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS 형식
        const filename = `members_export_${formattedDate}_${formattedTime}.xlsx`;

        // 파일 다운로드
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

