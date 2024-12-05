import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { TiPlus } from "react-icons/ti";
import TransactionDrawer from './TransactionDrawer';
import AnimatedNumber from './AnimatedNumber';
import { AuthContext } from '../context/AuthProvider';

function CardBalance({ onSave, currentBalance, teamFund, userCards }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { user } = useContext(AuthContext);

    // 트랜잭션 저장 및 카드 잔액 업데이트
    const handleSave = async (transactionData) => {
        try {
            onSave(transactionData); // 부모 컴포넌트에서 onSave 호출
            setIsDrawerOpen(false);
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };

    // 드로어 열기/닫기
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
            <div className='flex justify-center items-center gap-x-3 mt-10'>
                <button
                    onClick={handleOpenDrawer}
                    className='inline-flex items-center gap-x-2 py-3 px-10 border-2 border-blue-100 rounded-full text-white'
                >
                    <TiPlus /> 지출 기록
                </button>
            </div>

            {/* 트랜잭션 드로어 컴포넌트 */}
            <TransactionDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                onSave={handleSave}
                userCards={userCards} // 카드 정보
                isEditing={false} // 트랜잭션 수정 모드가 아님
                transactionData={{}} // 새로운 트랜잭션 데이터
                errMsg={null} // 에러 메시지
                user={user} // 사용자 정보
                cardBalance={currentBalance} // 카드 잔액 (롤오버 금액과 팀 펀드를 포함한 잔액)
                teamFund={teamFund || 0} // 팀 펀드 (부모에서 전달)
                onDelete={(data) => {
                    console.log("Transaction deleted:", data);
                    handleCloseDrawer();
                }} 
            />
        </div>
    );
}

CardBalance.propTypes = {
    onSave: PropTypes.func.isRequired,  // 트랜잭션 저장 함수
    currentBalance: PropTypes.number.isRequired, // 카드 잔액
    teamFund: PropTypes.number, // 팀 펀드
    userCards: PropTypes.array.isRequired, // 카드 정보
};

export default CardBalance;