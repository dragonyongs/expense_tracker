const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

async function fixMenuItems() {
    try {
        // 유효하지 않은 deposit_type 값을 가진 트랜잭션 확인
        const invalidTransactions = await Transaction.find({
            $or: [
                { deposit_type: { $nin: ['RegularDeposit', 'TransportationDeposit', 'TeamFund', 'AdditionalDeposit'] } },
                { menu_name: { $exists: true } } // 기존 마이그레이션 작업 포함
            ]
        });

        for (const transaction of invalidTransactions) {
            // deposit_type 수정
            if (transaction.deposit_type === 'TransportationExpense') {
                transaction.deposit_type = 'TransportationDeposit'; // 적절한 값으로 수정
            }

            // menu_name -> menu_items로 이동
            if (transaction.menu_name) {
                if (!transaction.menu_items || transaction.menu_items.length === 0) {
                    transaction.menu_items = [{
                        name: transaction.menu_name,
                        price: transaction.transaction_amount,
                        quantity: 1,
                    }];
                } else if (!transaction.menu_items[0].name) {
                    transaction.menu_items[0].name = transaction.menu_name;
                }

                transaction.menu_name = undefined; // menu_name 필드 삭제
            }

            // 데이터 저장
            await transaction.save();
            console.log(`Migrated transaction: ${transaction._id}`);
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

module.exports = { fixMenuItems };