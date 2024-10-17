const DateModel = require('../models/Date'); // 모델 이름을 Date에서 DateModel로 변경
const Profile = require('../models/Profile');

exports.createDate = async (req, res) => {
    try {
        const { member_id, date_type, date } = req.body;

        // 새로운 날짜 객체 생성
        const newDate = new DateModel({
            member_id, 
            date_type, 
            date
        });

        console.log('newDate', newDate);

        // 날짜 저장
        const savedDate = await newDate.save();

        // 프로필 조회
        let profile = await Profile.findOne({ member_id });

        // 프로필이 없는 경우 새로운 프로필 생성
        if (!profile) {
            profile = new Profile({
                member_id,
                dates: [] // 초기 dates 배열
            });
        }

        // 날짜 ID가 이미 존재하지 않는 경우에만 추가
        if (!profile.dates.includes(savedDate._id)) {
            profile.dates.push(savedDate._id);
        }

        console.log('profile', profile);
        
        // 프로필 저장
        await profile.save();

        // 생성된 날짜 반환
        res.status(201).json(savedDate);
    } catch (error) {
        console.error('Error creating date:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getDates = async (req, res) => {
    try {
        // 특정 멤버의 모든 날짜 가져오기
        const dates = await DateModel.find({ member_id: req.params.member_id });
        res.status(200).json(dates);
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateDate = async (req, res) => {
    try {
        // 날짜 업데이트
        const updatedDate = await DateModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log("updatedDate:", updatedDate);
        
        if (!updatedDate) return res.status(404).json({ message: 'Date not found' });

        // 프로필에서 날짜 ID를 업데이트
        const profile = await Profile.findOne({ dates: req.params.id });
        if (profile) {
            profile.dates = profile.dates.map(dateId =>
                dateId.toString() === req.params.id ? updatedDate._id : dateId
            );
            await profile.save();
            console.log('Profile updated:', profile);
        }
        
        res.status(200).json(updatedDate);

    } catch (error) {
        console.error('Error updating date:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteDate = async (req, res) => {
    try {
        // 날짜 삭제
        const deletedDate = await DateModel.findByIdAndDelete(req.params.id);
        if (!deletedDate) return res.status(404).json({ message: 'Date not found' });

        // 삭제 후 프로필에서 해당 날짜 ID 제거
        const profile = await Profile.findOne({ dates: req.params.id });
        if (profile) {
            profile.dates = profile.dates.filter(dateId => dateId.toString() !== req.params.id);
            await profile.save();
        }

        res.status(200).json({ message: 'Date deleted successfully' });
    } catch (error) {
        console.error('Error deleting date:', error);
        res.status(500).json({ message: error.message });
    }
};
