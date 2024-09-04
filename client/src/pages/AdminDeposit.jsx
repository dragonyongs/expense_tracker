import React, { useState, useEffect } from 'react';
import { IoAddCircleOutline } from "react-icons/io5";

const TRANSACTION_URL = '/api/transactions';

const AdminDeposit = () => {

    const [deposits, setDeposits] = useState([]);
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        setErrMsg('');
    }, [deposits])

    const fetchDeposits = async () => {
        
    }

    return (
        <>
            <div className='w-full mt-4 p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">입출금 거래내역</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl'
                        
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root'>
                    {deposits.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            데이터가 없습니다.
                        </div>
                    ) : (
                        <h1>DATA</h1>
                    )}
                </div>
            </div>
        </>
    )
}

export default AdminDeposit;