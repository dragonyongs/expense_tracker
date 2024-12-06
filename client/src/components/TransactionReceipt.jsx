import React, { forwardRef } from 'react';
import { formatDateToKorean } from '../utils/dateUtils';
import { TbCreditCardPay } from "react-icons/tb";

const TransactionReceipt = forwardRef(({ transaction, cardNumber, cardUser }, ref) => {

    if (!transaction) {
        return (
            <div className="text-center text-gray-500">
                거래 내역이 없습니다.
            </div>
        );
    }

    return (
        <>
            <div ref={ref} className="mx-auto w-full bg-white">
                <div className='pt-6'>
                    <div className="flex flex-col items-center justify-between mb-3 gap-y-3">
                        <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                            <TbCreditCardPay className="w-6 h-6" />
                        </div>
                        <div className="print:text-xl text-2xl font-semibold text-center">{transaction.merchant_name}</div>
                    </div>

                    <div className="text-center text-green-500 print:text-2xl text-3xl font-bold mt-2 mb-6">
                    ₩ {transaction.transaction_amount.toLocaleString()}
                    </div>
                </div>

                <div className="max-w-sm mx-auto pt-6 border-t-2 border-dashed border-t-gray-200 py-6 px-8">
                    <div className="grid grid-cols-4 gap-3 print:text-lg">
                        <div className="font-medium">카드번호</div>
                        <div className='col-span-3'>{cardNumber}</div>
                        <div className="font-medium">거래일자</div>
                        <div className='col-span-3'>{formatDateToKorean(transaction.transaction_date)}</div>
                        <div className="font-medium">거래상점</div>
                        <div className='col-span-3'>{transaction.merchant_name}</div>
                        {transaction.menu_name.length !== 0 && (
                            <>
                                <div className="font-medium">주문메뉴</div>
                                <div className='col-span-3'>{transaction.menu_name}</div>
                            </>
                        )}
                        <div className="font-medium">사용직원</div>
                        <div className='col-span-3'>{`${cardUser.member_name} ${cardUser.position}`}</div>
                        <div className="font-medium">거래금액</div>
                        <div className='col-span-3'>{transaction.transaction_amount.toLocaleString()}원</div>
                    </div>
                </div>
            </div>
        </>
    );

});

TransactionReceipt.displayName = "TransactionReceipt";

export default TransactionReceipt;