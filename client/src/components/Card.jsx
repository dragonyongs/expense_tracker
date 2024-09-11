import React from 'react';
import PropTypes from 'prop-types'; 

const Card = ({ cardNumber, totalSpent, currentBalance, rolloverAmount }) => {
    const formattedCardNumber = cardNumber.replace(/\D/g, ''); // 숫자 이외의 문자는 제거
    const maskedCardNumber = formattedCardNumber.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1-****-$3-$4');

    return (
        <div className="max-w-sm mx-auto h-48 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            
            {/* 카드 느낌의 배경 */}
            <div className="absolute top-0 left-0 w-full h-full bg-opacity-10 bg-gradient-to-b to-green-400 from-transparent z-[-1]"></div>

            {/* 카드 번호 */}
            <div className="relative text-lg font-semibold tracking-wider mb-5">
                <p className="tracking-widest">
                    {maskedCardNumber}
                </p>
            </div>

            {/* 이월 잔액 */}
            <div className="relative flex justify-between items-cente mb-1">
                <p className="text-sm font-light">이월 잔액</p>
                <p className="text-lg font-bold">
                    {rolloverAmount.toLocaleString()}원
                </p>
            </div>

            {/* 총 지출 금액 */}
            <div className="relative flex justify-between items-center mb-1">
                <p className="text-sm font-light">총 지출 금액</p>
                <p className="text-lg font-bold">
                    {totalSpent.toLocaleString()}원
                </p>
            </div>

            {/* 현재 잔액 */}
            <div className="relative flex justify-between items-center">
                <p className="text-sm font-light">현재 잔액</p>
                <p className="text-lg font-bold">
                    {currentBalance.toLocaleString()}원
                </p>
            </div>

        </div>
    );
};

Card.propTypes = {
    cardNumber: PropTypes.string.isRequired, // 카드 번호는 문자열로 받음
    totalSpent: PropTypes.number.isRequired, // 총 지출 금액은 숫자형
    currentBalance: PropTypes.number.isRequired, // 현재 잔액도 숫자형
    rolloverAmount: PropTypes.number.isRequired
};

export default Card;
