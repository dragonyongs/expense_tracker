const mongoose = require('mongoose');
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

        console.log('newDate (before save):', newDate);

        // 날짜 저장
        const savedDate = await newDate.save();
        console.log('savedDate (after save):', savedDate); // 저장된 후의 상태 확인

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
        if (!profile.dates.some(dateId => dateId.toString() === savedDate._id.toString())) {
            profile.dates.push(savedDate._id);
        }

        console.log('profile (before save):', profile);
        console.log('profile.dates after push:', profile.dates); // dates 배열 확인
        
        // 프로필 저장
        await profile.save();

        // 프로필 저장 후 다시 한 번 확인 (populate 사용)
        const updatedProfile = await Profile.findOne({ member_id }).populate('dates');
        console.log('Updated profile with populated dates:', updatedProfile);

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

        // 프로필에서 날짜 ID를 찾아서 업데이트
        const profile = await Profile.findOne({ dates: req.params.id });

        if (profile) {
            // dates 배열에서 해당 날짜 ID를 찾아 업데이트된 날짜로 교체
            profile.dates = profile.dates.map(dateId =>
                dateId.toString() === req.params.id ? updatedDate._id : dateId
            );
            
            console.log('Profile before saving:', profile);
            await profile.save(); // 프로필 저장
            console.log('Profile after saving:', profile);
        } else {
            console.log('Profile not found for the date ID.');
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
            // dates 배열에서 삭제할 날짜 ID 제거
            profile.dates = profile.dates.filter(dateId => dateId.toString() !== req.params.id);
            
            console.log('Profile before saving (after delete):', profile);
            await profile.save(); // 프로필 저장
            console.log('Profile after saving (after delete):', profile);
        } else {
            console.log('Profile not found for the date ID.');
        }

        res.status(200).json({ message: 'Date deleted successfully' });
    } catch (error) {
        console.error('Error deleting date:', error);
        res.status(500).json({ message: error.message });
    }
};
