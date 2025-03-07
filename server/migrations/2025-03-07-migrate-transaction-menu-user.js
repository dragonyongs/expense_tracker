/*
  Migration Script with Card lookup
  - 기존 Transaction 문서에서 recorded_by가 없는 경우,
    해당 카드의 member_id를 조회하여 자동으로 기록합니다.
  - 각 menu_item의 user 필드가 없는 경우, txn.recorded_by의 값을 할당합니다.
*/

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction'); // 실제 경로로 수정
const Card = require('../models/Card'); // 실제 경로로 수정

async function migrateTransactions() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
            process.exit(1); // 연결 실패 시 프로세스 종료
        });
        console.log('MongoDB에 연결되었습니다.');

        const transactions = await Transaction.find({});
        for (const txn of transactions) {
            let updated = false;
            // recorded_by가 없는 경우, card_id를 사용하여 카드 모델에서 member_id를 조회
            if (txn.transaction_type === 'expense' && !txn.recorded_by) {
                const card = await Card.findById(txn.card_id);
                if (card && card.member_id) {
                    txn.recorded_by = card.member_id;
                    updated = true;
                } else {
                    console.warn(`Transaction ${txn._id}: 카드 혹은 member_id를 찾을 수 없습니다.`);
                }
            }
            // 각 menu_item에 대해 member_id 필드가 없으면 recorded_by의 값을 할당
            if (txn.transaction_type === 'expense' && txn.menu_items && txn.menu_items.length > 0) {
                txn.menu_items.forEach(item => {
                    if (!item.member_id) {
                        item.member_id = txn.recorded_by;
                        updated = true;
                    }
                });
            }
            if (updated) {
                await txn.save();
                console.log(`Transaction ${txn._id} 업데이트 완료.`);
            }
        }

        console.log('마이그레이션이 완료되었습니다.');
        process.exit(0);
    } catch (error) {
        console.error('마이그레이션 중 오류 발생:', error);
        process.exit(1);
    }
}

module.exports = { migrateTransactions };