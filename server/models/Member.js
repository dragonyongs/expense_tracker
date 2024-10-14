const mongoose = require('mongoose');
const Status = require('./Status'); // Status 모델을 불러옴

const memberSchema = new mongoose.Schema({
    member_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rank: { type: String, default: null },
    position: { type: String, default: null },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', default: null },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
    status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null },
}, { timestamps: true });

// Pre-save hook to dynamically set status_id and role_id if not provided
memberSchema.pre('save', async function (next) {
    // status_id가 없을 경우 'pending' 상태의 ObjectId로 설정
    if (!this.status_id) {
        const pendingStatus = await Status.findOne({ status_name: 'pending' });
        if (pendingStatus) {
            this.status_id = pendingStatus._id;
        }
    }

    // role_id가 없을 경우 지정된 ObjectId로 설정
    if (!this.role_id) {
        // 특정 ObjectId 값을 하드코딩 (추후 생성된 '66d00d41d4b33b5f82639c28' 역할)
        this.role_id = new mongoose.Types.ObjectId('66d00d41d4b33b5f82639c28');
    }

    next();
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
