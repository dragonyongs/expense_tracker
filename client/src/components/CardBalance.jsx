import React, { useState} from 'react';
import PropTypes from 'prop-types';
import { ConfettiEffect } from './ConfettiEffect';
import TransactionDrawer from './TransactionDrawer';
import AnimatedNumber from './AnimatedNumber';
import { TiPlus } from "react-icons/ti";
import useDrawerTheme from '../hooks/useDrawerTheme';

function CardBalance({ onSave, onDelete, currentBalance, teamFund, userCards, cardBalance, errMsg }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [confettiTrigger, setConfettiTrigger] = useState(false);
    useDrawerTheme(isDrawerOpen);

    const handleSave = async (transactionData) => {
        try {
            await onSave(transactionData); // 부모로 저장 요청 전달
        } catch (error) {
            console.error("Error saving transaction:", error);
        } finally {
            setConfettiTrigger(true);
            setTimeout(() => setConfettiTrigger(false), 3000);
            setIsDrawerOpen(false);
        }
    };
    
    const handleDelete = async (transactionId) => {
        try {
            await onDelete(transactionId);
            setIsDrawerOpen(false);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const handleOpenDrawer = () => setIsDrawerOpen(true);
    const handleCloseDrawer = () => setIsDrawerOpen(false);

    return (
        <div className='flex flex-col items-center gap-y-3 pt-6 pb-4 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
            <p className='text-xl text-blue-200'>
                카드 잔액 {5000 > currentBalance ? "🥲" : 10000 >= currentBalance ? "😱" : "🤑"}
            </p>
            <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
                <span className="font-thin">₩</span>
                <p className="font-semibold">
                    <AnimatedNumber value={currentBalance} />
                </p>
            </div>
            <div className='flex justify-center items-center gap-x-3 mt-8'>
                <button
                    onClick={handleOpenDrawer}
                    className='inline-flex items-center gap-x-2 py-2 px-6 border-2 border-blue-100 rounded-full text-white'
                >
                    <TiPlus /> 카드 지출
                </button>
                <ConfettiEffect triggerConfetti={confettiTrigger} />
            </div>

            {/* 트랜잭션 드로어 컴포넌트 */}
            <TransactionDrawer
                drawerColor="#FFFFFF"
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                onSave={handleSave} // 저장 요청 전달
                onDelete={handleDelete} // 삭제 요청 전달
                userCards={userCards} // 카드 정보
                isEditing={false} // 트랜잭션 수정 모드가 아님
                transactionData={{}} // 새로운 트랜잭션 데이터
                errMsg={errMsg} // 에러 메시지
                cardBalance={cardBalance} // 카드 잔액
                teamFund={teamFund || 0} // 팀 펀드
            />
        </div>
    );
}

CardBalance.propTypes = {
    onSave: PropTypes.func.isRequired, // 저장 요청 함수
    onDelete: PropTypes.func.isRequired, // 삭제 요청 함수
    currentBalance: PropTypes.number.isRequired, // 카드 잔액
    teamFund: PropTypes.number, // 팀 펀드
    cardBalance: PropTypes.number, // 팀카드 잔액
    userCards: PropTypes.array.isRequired, // 카드 정보
    errMsg: PropTypes.string.isRequired,
};

export default CardBalance;

// import React, { useEffect, useState, useContext } from 'react';
// import PropTypes from 'prop-types';
// import { AuthContext } from '../context/AuthProvider';
// import { ConfettiEffect } from './ConfettiEffect';
// import TransactionDrawer from './TransactionDrawer';
// import AnimatedNumber from './AnimatedNumber';
// import { TiPlus } from "react-icons/ti";

// function CardBalance({ onSave, currentBalance, teamFund, userCards, cardBalance }) {
//     const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//     const { user } = useContext(AuthContext);
//     const [confettiTrigger, setConfettiTrigger] = useState(false);

//     const handleSave = async (transactionData) => {
//         try {
//             onSave(transactionData);

//             setIsDrawerOpen(false);
//             setConfettiTrigger(true);

//             setTimeout(() => {
//                 setConfettiTrigger(false);
//             }, 3000);
//         } catch (error) {
//             console.error('Error saving transaction:', error);
//         }
//     };

//     const handleOpenDrawer = () => setIsDrawerOpen(true);
//     const handleCloseDrawer = () => setIsDrawerOpen(false);
    
//     return (
//         <div className='flex flex-col items-center gap-y-3 pt-6 pb-4 rounded-es-4xl rounded-ee-4xl bg-[#0433FF]'>
//             <p className='text-xl text-blue-200'>
//                 카드 잔액 {5000 > currentBalance ? "🥲" : 10000 >= currentBalance ? "😱" : "🤑"}
//             </p>
//             <div className='flex justify-center items-center gap-x-2 text-white text-5xl tracking-tighter'>
//                 <span className="font-thin">₩</span>
//                 <p className="font-semibold">
//                     <AnimatedNumber value={currentBalance} />
//                 </p>
//             </div>
//             <div className='flex justify-center items-center gap-x-3 mt-10'>
//                 <button
//                     onClick={handleOpenDrawer}
//                     className='inline-flex items-center gap-x-2 py-3 px-10 border-2 border-blue-100 rounded-full text-white'
//                 >
//                     <TiPlus /> 카드 지출
//                 </button>
//                 <ConfettiEffect triggerConfetti={confettiTrigger} />
//             </div>

//             {/* 트랜잭션 드로어 컴포넌트 */}
//             <TransactionDrawer
//                 isOpen={isDrawerOpen}
//                 onClose={handleCloseDrawer}
//                 onSave={handleSave}
//                 userCards={userCards} // 카드 정보
//                 isEditing={false} // 트랜잭션 수정 모드가 아님
//                 transactionData={{}} // 새로운 트랜잭션 데이터
//                 errMsg={null} // 에러 메시지
//                 // user={user} // 사용자 정보
//                 cardBalance={cardBalance} // 카드 잔액 (롤오버 금액과 팀 펀드를 포함한 잔액)
//                 teamFund={teamFund || 0} // 팀 펀드 (부모에서 전달)
//                 onDelete={(data) => {
//                     console.log("Transaction deleted:", data);
//                     handleCloseDrawer();
//                 }} 
//             />
//         </div>
//     );
// }

// CardBalance.propTypes = {
//     onSave: PropTypes.func.isRequired,  // 트랜잭션 저장 함수
//     currentBalance: PropTypes.number.isRequired, // 카드 잔액
//     teamFund: PropTypes.number, // 팀 펀드
//     cardBalance: PropTypes.number, // 팀카드 잔액
//     userCards: PropTypes.array.isRequired, // 카드 정보
// };

// export default CardBalance;