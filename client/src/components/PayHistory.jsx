import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine } from "react-icons/ri";
import { BsPrinter } from "react-icons/bs";
import { MutatingDots } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import CommonDrawer from '../components/CommonDrawer'; // CommonDrawer 호출
import TransactionReceipt from '../components/TransactionReceipt';

const PayHistory = ({ transactions, userCards, isLoading }) => {
    const [isTransactionReceiptOpen, setTransactionReceiptOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(''); // 선택된 거래 내역
    const [selectedCardNumber, setSelectedCardNumber] = useState('');
    const [selectedCardUser, setSelectedCardUser] = useState({});

    const transactionRef = useRef(null);

    useEffect(() => {
        if (selectedTransaction) {
            const foundCard = userCards.find(card => card._id === selectedTransaction.card_id);
            setSelectedCardNumber(foundCard.card_number);
            setSelectedCardUser(foundCard.member_id);
        }
    }, [selectedTransaction]);
    

    const handleOpenTransactionReceipt = (transaction) => {
        setSelectedTransaction(transaction); // 선택된 거래 내역 설정
        setTransactionReceiptOpen(true); // Drawer 열기
    };

    const handleCloseDrawer = () => {
        setTransactionReceiptOpen(false); // Drawer 닫기
    };

    const handlePrint = () => {
        console.log('transactionRef', transactionRef);
        if (transactionRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>프린트</title>
                            <style>
                                @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
                            </style>
                        </head>
                        <body>
                            <div class="flex justify-center items-center w-screen h-screen bg-gray-100">
                                <div class="flex-grow max-w-sm py-6 border border-gray-300 rounded-md bg-white">
                                    ${transactionRef.current.outerHTML}
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();

                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                }
            }
        }
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
            userCards={userCards}
            onClose={handleCloseDrawer}
            title="거래 내역"
        >
            <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen dark:bg-slate-800">
                <TransactionReceipt ref={transactionRef} transaction={selectedTransaction} cardNumber={selectedCardNumber} cardUser={selectedCardUser} />
            </div>
            <div className="flex flex-col gap-y-2 px-6 dark:bg-slate-800">
                <button
                    type="button"
                    onClick={handlePrint}
                    className='flex justify-center items-center gap-x-3 py-3 border border-gray-300 rounded-lg text-black font-semibold dark:text-gray-400 dark:font-normal'
                >
                    <BsPrinter className='w-5 h-5' /> 프린트
                </button>
                <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className='py-3 border border-gray-300 rounded-lg text-gray-500 font-semibold dark:text-gray-400 dark:font-normal'
                >
                    닫기
                </button>
            </div>
        </CommonDrawer>
        </div>
    );
};

PayHistory.propTypes = {
    transactions: PropTypes.array.isRequired,
    userCards: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default PayHistory;
