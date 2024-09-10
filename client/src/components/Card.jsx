import React from 'react';
import PropTypes from 'prop-types'; 

const Card = ({ cardNumber, totalSpent, currentBalance }) => {
    // 카드 번호에서 하이픈(-)을 제거하고 마스킹 처리한 후 다시 하이픈을 넣는 방식
    const formattedCardNumber = cardNumber.replace(/\D/g, ''); // 숫자 이외의 문자는 제거
    const maskedCardNumber = formattedCardNumber.replace(/^(\d{4})(\d{4})(\d{4})(\d{4})$/, '$1-****-$3-$4');

    return (
        <div className="max-w-sm mx-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* 카드 번호 */}
            <div className="text-lg font-semibold tracking-wider mb-4">
                <p className="tracking-widest">
                    {maskedCardNumber}
                </p>
            </div>

            {/* 총 지출 금액 */}
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-light">총 지출 금액</p>
                <p className="text-lg font-bold">
                    {totalSpent.toLocaleString()}원
                </p>
            </div>

            {/* 현재 잔액 */}
            <div className="flex justify-between items-center">
                <p className="text-sm font-light">현재 잔액</p>
                <p className="text-lg font-bold">
                    {currentBalance.toLocaleString()}원
                </p>
            </div>
            
            {/* 카드 느낌의 배경 */}
            <div className="absolute -z-10 top-0 left-0 w-full h-full bg-opacity-25 bg-gradient-to-b from-newBlue to-transparent"></div>

        </div>
    );
};

Card.propTypes = {
    cardNumber: PropTypes.string.isRequired, // 카드 번호는 문자열로 받음
    totalSpent: PropTypes.number.isRequired, // 총 지출 금액은 숫자형
    currentBalance: PropTypes.number.isRequired, // 현재 잔액도 숫자형
};

export default Card;
