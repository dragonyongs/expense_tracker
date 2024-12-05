import React from 'react';
import { formatDateToKorean } from '../utils/dateUtils';

const TransactionReceipt = ({transaction}) => {
    return (
        <>
            <div className="mx-2 max-w-md bg-white p-4">
                <div className="flex flex-col items-center justify-between mb-3 gap-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <span className="text-xl">✔</span>
                    </div>
                    <div className="text-2xl font-semibold text-center">{transaction.merchant_name}</div>
                </div>

                <div className="text-center text-green-500 text-3xl font-bold mb-6">
                ₩ {transaction.transaction_amount.toLocaleString()}
                </div>

                <div className="pt-6 border-t-2 border-dashed border-t-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                        {/* <div className="font-medium">카드번호:</div>
                        <div>{transaction.card_number}</div> */}
                        <div className="font-medium">거래일자:</div>
                        <div>{formatDateToKorean(transaction.transaction_date)}</div>
                        <div className="font-medium">거래상점:</div>
                        <div>{transaction.merchant_name}</div>
                        {transaction.menu_name.length !== 0 && (
                            <>
                                <div className="font-medium">메뉴명:</div>
                                <div>{transaction.menu_name}</div>
                            </>
                        )}
                        <div className="font-medium">거래금액:</div>
                        <div>{transaction.transaction_amount.toLocaleString()}원</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TransactionReceipt;