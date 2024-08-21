const mongoose = require('mongoose');
const Status = require('./Status'); // Status 모델을 불러와야 함

const memberSchema = new mongoose.Schema({
    member_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null },  // 기본값 null
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    card_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    rank: { type: String, default: null },
    position: { type: String, default: null },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
}, { timestamps: true });

// Pre-save hook to dynamically set status_id to "pending" if not provided
memberSchema.pre('save', async function (next) {
    if (!this.status_id) {
        const pendingStatus = await Status.findOne({ status_name: 'pending' });
        if (pendingStatus) {
            this.status_id = pendingStatus._id;  // pending 상태의 ObjectId를 설정
        }
    }
    next();
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
