const Date = require('../models/Date');
const Profile = require('../models/Profile');

exports.createDate = async (req, res) => {
    try {
        const { member_id, date_type, date } = req.body;

        const newDate = new Date({
            member_id, 
            date_type, 
            date
        });

        const savedDate = await newDate.save();

        let profile = await Profile.findOne({ member_id });

        if(!profile) {
            profile = new Profile ( {
                member_id,
                dates: []
            });
        }

        profile.dates.push(savedDate._id);
        await profile.save();

        res.status(201).json(savedDate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.getDates = async (req, res) => {
    try {
        const dates = await Date.find({ member_id: req.params.member_id });
        res.status(200).json(dates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateDate = async (req, res) => {
    try {

        const updatedDate = await Date.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log("updatedDate:", updatedDate);
        
        if (!updatedDate) return res.status(404).json({ message: 'Date not found' });

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
        res.status(400).json({ message: error.message });
    }
}

exports.deleteDate = async (req, res) => {
    try {
        const deletedDate = await Date.findByIdAndDelete(req.params.id);
        if (!deletedDate) return res.status(404).json({ message: 'Date not found' });
        res.status(200).json({ message: 'Date deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};