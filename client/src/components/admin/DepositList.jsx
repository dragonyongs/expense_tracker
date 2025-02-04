import React from 'react'
import useDepositManagement from '../../hooks/useDepositManagement';

const DepositList = ({deposits, onOpenDrawer}) => {
    return (
        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
            {deposits.length === 0 ? (
                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                    데이터가 없습니다.
                </div>
            ) : (
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {deposits.map(deposit => (
                        <li key={deposit._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => onOpenDrawer(deposit)}>
                            <div className="flex items-center py-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                    {new Date(deposit.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} {deposit.merchant_name} {deposit.transaction_type}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                        {deposit.menu_items.map(item => item.name).join(', ')}
                                    </p>
                                </div>
                                <div className="text-base text-gray-900 dark:text-white">
                                    {deposit?.is_deducted ? '-' : '+'} <span className="font-bold">{deposit.transaction_amount.toLocaleString()}</span> 원
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DepositList