import React, { useEffect, useState } from 'react'
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
    }

    return (
        <>
            <div className="mt-10 px-6">
                <h3 className='font-semibold text-2xl'>최근 결제</h3>
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                { transactions
                    .filter(type => type.transaction_type !== '입금')
                    .slice(0, 4)
                    .map( transaction => (
                    <li key={transaction._id} className='flex justify-between items-center py-3'>
                        <div className="flex-1 min-w-0">
                            <p className='font-semibold text-sm text-slate-500 truncate'>{new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</p>
                            <p className='truncate' >
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
            </div>
        </>
    )
}

export default PayHistory