import React, { useEffect, useState } from 'react';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance";

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
    const filteredTransactions = transactions.filter(type => type.transaction_type !== '입금');

    return (
        <>
            <h3 className='mt-10 px-6 font-semibold text-2xl'>최근 결제</h3>
            <div className="px-6 h-full">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <img src="/icon-wallet.png" alt="No Transactions" className="mb-4 w-48 h-48" />
                        <p className='text-lg text-gray-600'>최근 결제 내역이 없습니다</p>
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-200">
                        {filteredTransactions
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .slice(0, 4)
                            .map(transaction => (
                                <li key={transaction._id} className='flex justify-between items-center py-3'>
                                    <div className="flex-1 min-w-0">
                                        <p className='font-semibold text-sm text-slate-500 truncate'>{new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
                                        <p className='truncate'>
                                            {transaction.merchant_name}
                                            <span className="ms-2 text-sm text-gray-400">
                                                {transaction.menu_name}
                                            </span>
                                        </p>
                                    </div>
                                    <div className='font-semibold'>{transaction.transaction_amount.toLocaleString()}원</div>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default PayHistory;
