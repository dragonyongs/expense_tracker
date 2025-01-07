const mongoose = require('mongoose');
const Transaction = require('../models/Transaction'); // 실제 경로 확인
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // 연결 실패 시 프로세스 종료
    });

async function migrateTransactions() {
    try {
        // menu_name이 있는 트랜잭션만 가져오기
        const transactions = await Transaction.find({ menu_name: { $exists: true } });

        // BulkWrite를 위한 작업 배열 생성
        const bulkOperations = transactions.map(transaction => {
            const menuItem = {
                name: transaction.menu_name,
                price: transaction.transaction_amount,
                quantity: 1,
            };

            return {
                updateOne: {
                    filter: { _id: transaction._id },
                    update: {
                        $set: { menu_items: [menuItem] },
                        $unset: { menu_name: "" },
                    },
                },
            };
        });

        if (bulkOperations.length > 0) {
            const result = await Transaction.bulkWrite(bulkOperations);
            console.log(`Migration complete! Migrated ${result.nModified} transactions.`);
        } else {
            console.log('No transactions to migrate.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

module.exports = { migrateTransactions };