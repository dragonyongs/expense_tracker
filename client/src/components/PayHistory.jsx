import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine } from "react-icons/ri";
import { MutatingDots } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import CommonDrawer from '../components/CommonDrawer'; // CommonDrawer 호출
import TransactionReceipt from '../components/TransactionReceipt';

const PayHistory = ({ transactions, isLoading }) => {
    const [isTransactionReceiptOpen, setTransactionReceiptOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null); // 선택된 거래 내역

    const handleOpenTransactionReceipt = (transaction) => {
        setSelectedTransaction(transaction); // 선택된 거래 내역 설정
        setTransactionReceiptOpen(true); // Drawer 열기
    };

    const handleCloseDrawer = () => {
        setTransactionReceiptOpen(false); // Drawer 닫기
    };

    const filteredTransactions = transactions.filter(type => type.transaction_type !== 'income');

    return (
        <div className='flex flex-col pb-2 xl:px-4'>
        <div className="flex justify-between items-center mt-8 mb-2 px-6">
            <h3 className='font-semibold text-2xl dark:text-slate-400 dark:font-normal'>최근 결제</h3>
            <Link to={'/transactions'} className='flex items-center gap-x-1 text-slate-400'>전체 <RiArrowRightSLine /></Link>
        </div>
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-dashboard-screen">
            <MutatingDots
                visible={true}
                height="100"
                width="100"
                color="#b8a57f"
                secondaryColor="#0433FF"
                radius="12.5"
                ariaLabel="mutating-dots-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
            <p className='text-lg font-semibold text-blue-900 dark:text-gray-500'>데이터를 불러오는 중입니다.</p>
            </div>
        ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-dashboard-screen">
            <img src="/icon-wallet.png" alt="No Transactions" className="mb-4 w-32 h-32 dark:invert dark:opacity-40" />
            <p className='text-lg text-gray-600 dark:text-gray-500'>최근 결제 내역이 없습니다</p>
            </div>
        ) : (
            <div className="px-6 min-h-dashboard-screen">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredTransactions
                .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                .slice(0,10)
                .map(transaction => (
                    <li key={transaction._id} className='flex justify-between items-center py-3 cursor-pointer' onClick={() => handleOpenTransactionReceipt(transaction)}>
                    <div className="flex-1 min-w-0">
                        <p className='font-semibold text-sm text-slate-500 dark:text-slate-600 truncate'>
                        {new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                        </p>
                        <p className='truncate'>
                        <span className="dark:text-slate-300">{transaction.merchant_name}</span>
                        <span className="ms-2 text-sm text-gray-400 dark:text-slate-500">
                            {transaction.menu_name}
                        </span>
                        </p>
                    </div>
                    <div className='font-semibold dark:text-slate-300'>{transaction.transaction_amount.toLocaleString()}원</div>
                    </li>
                ))}
            </ul>
            </div>
        )}

        {/* CommonDrawer 컴포넌트 추가 */}
        <CommonDrawer
            color="#FFFFFF"
            isOpen={isTransactionReceiptOpen}
            onClose={handleCloseDrawer}
            title="거래 내역"
        >
            <TransactionReceipt transaction={selectedTransaction} />
        </CommonDrawer>
        </div>
    );
};

PayHistory.propTypes = {
    transactions: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default PayHistory;
