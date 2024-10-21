import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";
import { RiArrowRightSLine } from "react-icons/ri";

const PayHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchData(API_URLS.TRANSACTIONS, setTransactions);
    }, []);

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    // 입금을 제외한 거래 필터링
    const filteredTransactions = transactions.filter(type => type.transaction_type !== 'income');

    return (
        <div className='flex flex-col pb-2 xl:px-4'>
            <div className="flex justify-between items-center mt-8 mb-2 px-6">
                <h3 className='font-semibold text-2xl dark:text-slate-400 dark:font-normal'>최근 결제</h3>
                <Link to={'/transactions'} className='flex items-center gap-x-1 text-slate-400'>전체 <RiArrowRightSLine /></Link>
            </div>
            {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-dashboard-screen">
                    <img src="/icon-wallet.png" alt="No Transactions" className="mb-4 w-32 h-32 dark:invert dark:opacity-40" />
                    <p className='text-lg text-gray-600 dark:text-gray-500'>최근 결제 내역이 없습니다</p>
                </div>
            ) : (
                <div className="px-6">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-slate-700">
                        {filteredTransactions
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                            .slice(0,10)
                            .map(transaction => (
                                <li key={transaction._id} className='flex justify-between items-center py-3'>
                                    <div className="flex-1 min-w-0">
                                        <p className='font-semibold text-sm text-slate-500 dark:text-slate-600 truncate'>{new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
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
        </div>
    );
};

export default PayHistory;
