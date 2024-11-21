// // Require necessary modules
// const mongoose = require('mongoose');
// const Transaction = require('../models/Transaction'); // 경로는 실제 Transaction 모델 경로에 맞게 수정
// require('dotenv').config(); // .env 파일에서 DB 연결 정보 가져오기

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => {
//         console.error('Error connecting to MongoDB:', err);
//         process.exit(1); // 연결 실패 시 프로세스 종료
//     });

// // Migration function
// const migrateExpenseCard = async () => {
//     try {
//         // Update all expense transactions to include expense_card: "TeamCard"
//         const updatedExpenseCard = await Transaction.updateMany(
//             { transaction_type: 'expense' }, // 조건: 지출 트랜잭션
//             { $set: { expense_card: 'TeamCard' } } // expense_card 기본값 추가
//         );
//         console.log(`${updatedExpenseCard.modifiedCount} transactions updated with expense_card: "TeamCard"`);

//         // Log successful migration
//         console.log('Migration completed successfully!');
//     } catch (err) {
//         console.error('Error during migration:', err);
//     } finally {
//         // Close the database connection
//         mongoose.connection.close();
//     }
// };

// // Run the migration
// migrateExpenseCard();

// Require necessary modules
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction'); // 경로는 실제 Transaction 모델 경로에 맞게 수정
require('dotenv').config(); // .env 파일에서 DB 연결 정보 가져오기

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // 연결 실패 시 프로세스 종료
    });

// Migration function
const migrateExpenseCardAndType = async () => {
    try {
        // 첫 번째 작업: expense_type을 "RegularExpense"로 변경
        const updatedExpenseType = await Transaction.updateMany(
            { expense_type: 'TeamCard' }, // 조건: expense_type이 "TeamCard"인 트랜잭션
            { $set: { expense_type: 'RegularExpense' } } // expense_type을 "RegularExpense"로 변경
        );
        console.log(`${updatedExpenseType.modifiedCount} transactions updated with expense_type: "RegularExpense"`);

        // 두 번째 작업: expense_card 필드가 없는 경우 "TeamCard"로 추가
        const updatedExpenseCard = await Transaction.updateMany(
            { transaction_type: 'expense', expense_card: { $exists: false } }, // 조건: 지출 트랜잭션 중 expense_card가 없는 경우
            { $set: { expense_card: 'TeamCard' } } // expense_card 기본값 추가
        );
        console.log(`${updatedExpenseCard.modifiedCount} transactions updated with expense_card: "TeamCard"`);

        // 마이그레이션 완료 로그
        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        // 데이터베이스 연결 종료
        mongoose.connection.close();
    }
};

// 마이그레이션 실행
migrateExpenseCardAndType();