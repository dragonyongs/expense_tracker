import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import useMediaQuery from '../hooks/useMediaQuery';
import Loading from '../components/Loading';
import { PiCreditCardLight } from "react-icons/pi";
import ProgressBars from '../components/ProgressBars';
import HeaderWithTabs from '../components/HeaderWithTabs';
import { MdClose } from 'react-icons/md';
import { format } from 'date-fns';

function Teams() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPosition, setUserPosition] = useState('');
    const [remainingDays, setRemainingDays] = useState(0);

    const tabs = [
        { path: '/transactions', label: '지출 내역', title: '내카드' },
        { path: '/teams', label: '계좌 잔액', title: '팀계좌' },
    ];

    const fetchData = async (url) => {
        try {
            const response = await axios.get(url, { withCredentials: true });
            const fetchedAccounts = response.data;
            
            setAccounts(fetchedAccounts);
    
            const userCard = fetchedAccounts
                .flatMap(account => account.cards)
                .find(card => card.member_id === user.member_id);
    
            setUserPosition(userCard ? userCard.position : '팀원');
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}/${user.member_id}`);
        calculateRemainingDays();
    }, []);

    const calculateRemainingDays = () => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysLeft = (lastDayOfMonth - today) / (1000 * 60 * 60 * 24);
        setRemainingDays(Math.ceil(daysLeft));
    };

    if (loading) {
        return <Loading type="ThreeDots" />;
    }

    return (
        <>
            <HeaderWithTabs tabs={tabs} />
            <div className="flex flex-col gap-y-2 px-4 pb-4">
                {accounts.length === 0 ? (
                    <NoCardMessage />
                ) : (
                    <AccountList 
                        accounts={accounts} 
                        userName={user.name}
                        userPosition={userPosition} 
                        remainingDays={remainingDays} 
                    />
                )}
            </div>
        </>
    );
}

const NoCardMessage = () => (
    <div className="flex flex-col justify-center items-center h-default-screen text-gray-500 dark:text-gray-400">
        <PiCreditCardLight className="w-20 h-20" />
        <p>지정된 카드가 존재하지 않습니다.</p>
    </div>
);

const AccountList = ({ accounts, userPosition, userName, remainingDays }) => {
    return (
        <>
            {accounts.map(account => {
                const hasOvertimeMealCard = account.cards.some(card => card.card_type === "OvertimeMealCard");
                const isLeaderAccount = account.cards.some(card => card.position === "팀장");
                const isPartLeaderAccount = account.cards.some(card => card.position === "파트장" );
                const isUserAccount = account.cards.some(card => {card.member_name === userName});

                if (userPosition === "파트장" && isLeaderAccount && !hasOvertimeMealCard) {
                    return null;
                }

                if (
                    userPosition === "팀원" &&
                    (isLeaderAccount || isPartLeaderAccount) && // 팀장 또는 파트장 계좌
                    !hasOvertimeMealCard && // 야근식대가 아닌 경우
                    !isUserAccount // 자신의 카드가 아닌 경우
                ) {
                    return null;
                }
                
                return (
                    <AccountCard
                        key={account._id}
                        account={account}
                        userPosition={userPosition}
                        remainingDays={remainingDays}
                    />
                );
            })}
        </>
    );
};

const calculateTotalBalance = (cards) => {
    return cards.reduce((sum, card) => sum + card.balance + card.rollover_amount + card.team_fund, 0);
};

const AccountCard = ({ account, userPosition, remainingDays }) => {
    const totalBalance = calculateTotalBalance(account.cards); // 전체 카드의 잔액 합계

    // 팀장 및 야근식대 카드 분리
    const leaderCards = account.cards.filter(card => card.position === "팀장" && card.card_type !== "OvertimeMealCard");
    // const overtimeMealCards = account.cards.filter(card => card.card_type === "OvertimeMealCard");
    const overtimeMealCard = account.cards.find(card => card.card_type === "OvertimeMealCard");
    const otherCards = account.cards.filter(card => card.position !== "팀장" && card.card_type !== "OvertimeMealCard");
    const isWarning = remainingDays <= 7;

    return (
        <div className="pt-8 px-8 bg-white shadow-sm rounded-xl border-t dark:border dark:border-slate-700 dark:bg-slate-800">
            {/* 계좌 정보 */}
            <h3 className="text-md text-gray-500">
                {account.team_id.team_name} {account.account_number.split('-').slice(-1)} 계좌
            </h3>
            <h3 className="text-2xl text-gray-700 dark:text-slate-300 mt-2">
                <span className="font-bold">{totalBalance.toLocaleString()}원</span>
                {totalBalance > 0 && " 남음"}
                {!overtimeMealCard & isWarning ? <span className="pl-2 font-light text-lg">({remainingDays}일 남음)</span> : ''}
            </h3>

            <div className="mt-8">
                <div>
                    {overtimeMealCard && (
                        <CardDetail
                            key={overtimeMealCard.card_number}
                            card={overtimeMealCard}
                            remainingDays={remainingDays}
                            isOvertimeMealCard={true}
                        />
                    )}
                </div>

                {(userPosition === "팀장" || userPosition === "파트장" )&& leaderCards.length > 0 && (
                    <LeaderCardDetail leaderCards={leaderCards} teamMembersCount={account.cards.length} remainingDays={remainingDays} />
                )}

                {otherCards.length > 0 && otherCards.map(card => (
                    <CardDetail
                        key={card.card_number}
                        card={card}
                        teamMembersCount={account.cards.length}
                        remainingDays={remainingDays}
                        isOvertimeMealCard={false}
                    />
                ))}
            </div>
        </div>
    );
};

const LeaderCardDetail = ({leaderCards, teamMembersCount, remainingDays}) => {
    const totalBalance = leaderCards.reduce((sum, card) => sum + card.balance + card.rollover_amount + card.team_fund, 0);
    const teamFund = leaderCards.find(card => card.team_fund)?.team_fund || 0;
    const remainingBalanceCriteria = totalBalance / teamMembersCount > 10000;
    const isWarning = remainingBalanceCriteria && remainingDays <= 7;

    return (
        <div className="mb-10">
            <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                <span className="text-lg font-bold dark:text-slate-400">
                    {leaderCards[0].member_name}
                </span>
                <span className="text-base">{leaderCards[0].position}</span>
            </h3>
            {leaderCards.map(card => (
                <div key={card.card_number} className="flex justify-between mt-4 pt-4 border-t dark:border-slate-600">
                    <h4 className="text-md dark:text-slate-500">팀 카드비</h4>
                    <span className="text-lg font-bold dark:text-slate-400">
                        {card.balance.toLocaleString()}원
                    </span>
                </div>
            ))}

            {/* 팀 운영비 표시 */}
            <div className="flex justify-between mt-2">
                <h4 className="text-md dark:text-slate-500">팀 운영비</h4>
                <span className="text-lg font-bold dark:text-slate-400">
                    {teamFund.toLocaleString()}원
                </span>
            </div>

            {/* 전체 잔액 (카드 + 팀 운영비) */}
            <div className="flex justify-between mt-4 border-t pt-2 dark:border-slate-600">
                <h4 className="text-md font-bold dark:text-slate-500">총 잔액</h4>
                <span className={`text-lg font-bold ${isWarning ? 'text-red-500 dark:text-red-700' : 'text-green-600 dark:text-green-400 '}`}>
                    {(totalBalance).toLocaleString()}원
                </span>
            </div>

        </div>
    );
};

// const CardDetail = ({ card, teamMembersCount, remainingDays, isOvertimeMealCard }) => {
//     const [selectedTransactions, setSelectedTransactions] = useState([]);
//     const [isOpen, setIsOpen] = useState(false);

//     const totalBalance = card.balance + card.rollover_amount;
//     const remainingBalanceCriteria = totalBalance / teamMembersCount > 10000;
//     const isWarning = !isOvertimeMealCard && remainingBalanceCriteria && remainingDays <= 7;
//     const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;
//     const isMobile = useMediaQuery("(max-width: 640px)");
//     const drawerSize = isMobile ? "100%" : "375px";

//     const handleClick = async (cardId) => {
//         try {
//             setIsOpen(true);
//             const response = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
//             setSelectedTransactions(response.data);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const handleClose = () => {
//         setIsOpen(false);
//     }

//     return (
//         <>
//             <div className="mb-10" onClick={() => handleClick(card.card_id)}>
//                 <div className="flex justify-between mb-4">
//                     <h3 className="flex gap-x-2 items-center dark:text-slate-500">
//                         <span className="text-lg font-bold dark:text-slate-400">
//                             {isOvertimeMealCard ? "야근 식대" : card.member_name}
//                         </span>
//                         {!isOvertimeMealCard && <span className="text-base">{card.position}</span>}
//                     </h3>
//                     <span className="text-lg">
//                         <span className={`font-bold dark:text-slate-400 ${isWarning ? 'text-red-500 dark:text-red-700' : 'text-green-600 dark:text-green-400 '}"`}>{totalBalance.toLocaleString()}원</span>
//                         {totalBalance > 0 && <span className="dark:text-slate-500"> 남음</span>}
//                     </span>
//                 </div>
//                 <ProgressBars spentPercentage={spentPercentage} isWarning={isWarning} />
//             </div>

//             <Drawer open={isOpen} duration="300" direction="right" size={drawerSize}>
//                 <div className='flex justify-between items-center w-full h-12 pl-4 pr-1'>
//                     <h1 className='font-medium text-lg text-black'>거래내역</h1>
//                     <button onClick={handleClose} className="hover:bg-emerald-700 p-2 rounded-lg transition-colors">
//                         <MdClose className='text-2xl text-black'/>
//                     </button>
//                 </div>

//                 <div className="pt-2 px-4 space-y-6">
//                     {selectedTransactions.length === 0 ? (
//                         <p>거래내역이 없습니다.</p>
//                     ) : (
//                         <>
//                         <div className='bg-gray-50 h-drawer-screen'>
//                             {selectedTransactions.map( tx => (
//                                 <p key={tx._id}>
//                                     {tx.transaction_date}        
//                                     {tx.merchant_name}
//                                     {tx.transaction_amount}원
//                                 </p>
//                             ))}
//                         </div>
//                         <div className="flex flex-col gap-y-2 px-6 dark:bg-slate-800">
//                             <button
//                                 type="button"
//                                 onClick={handleClose} 
//                                 className='py-3 rounded-lg border border-gray-300 text-gray-600 font-semibold dark:text-gray-400 dark:font-normal'
//                             >
//                                 닫기
//                             </button>
//                         </div>
//                         </>
//                     )
//                     } 
//                 </div>

//             </Drawer>
//         </>
//     );
// };

// const CardDetail = ({ card, teamMembersCount, remainingDays, isOvertimeMealCard }) => {
//     const [selectedTransactions, setSelectedTransactions] = useState([]);
//     const [isOpen, setIsOpen] = useState(false);

//     const totalBalance = card.balance + card.rollover_amount;
//     const remainingBalanceCriteria = totalBalance / teamMembersCount > 10000;
//     const isWarning = !isOvertimeMealCard && remainingBalanceCriteria && remainingDays <= 7;
//     const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;
//     const isMobile = useMediaQuery("(max-width: 640px)");
//     const drawerSize = isMobile ? "100%" : "375px";

//     const handleClick = async (cardId) => {
//         try {
//             setIsOpen(true);
//             const response = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
//             setSelectedTransactions(response.data);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const handleClose = () => {
//         setIsOpen(false);
//     }

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return format(date, 'yyyy.MM.dd');
//     }

//     const formatAmount = (amount) => {
//         return amount.toLocaleString();
//     }

//     return (
//         <>
//             <div className="mb-10" onClick={() => handleClick(card.card_id)}>
//                 <div className="flex justify-between mb-4">
//                     <h3 className="flex gap-x-2 items-center dark:text-slate-500">
//                         <span className="text-lg font-bold dark:text-slate-400">
//                             {isOvertimeMealCard ? "야근 식대" : card.member_name}
//                         </span>
//                         {!isOvertimeMealCard && <span className="text-base">{card.position}</span>}
//                     </h3>
//                     <span className="text-lg">
//                         <span className={`font-bold dark:text-slate-400 ${isWarning ? 'text-red-500 dark:text-red-700' : 'text-green-600 dark:text-green-400'}`}>
//                             {totalBalance.toLocaleString()}원
//                         </span>
//                         {totalBalance > 0 && <span className="dark:text-slate-500"> 남음</span>}
//                     </span>
//                 </div>
//                 <ProgressBars spentPercentage={spentPercentage} isWarning={isWarning} />
//             </div>

//             <Drawer open={isOpen} duration="300" direction="right" size={drawerSize}>
//                 <div className="flex flex-col h-full">
//                     <div className="flex justify-between items-center w-full h-14 px-4 border-b border-gray-200 dark:border-gray-700">
//                         <h1 className="font-medium text-lg text-black dark:text-white">거래내역</h1>
//                         <button 
//                             onClick={handleClose} 
//                             className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
//                         >
//                             <MdClose className="text-2xl text-black dark:text-white"/>
//                         </button>
//                     </div>

//                     <div className="flex-1 overflow-hidden">
//                         {selectedTransactions.length === 0 ? (
//                             <div className="p-4 text-center text-gray-500">
//                                 거래내역이 없습니다.
//                             </div>
//                         ) : (
//                             <div className="h-full flex flex-col">
//                                 <div className="overflow-x-auto">
//                                     <div className="inline-block min-w-full">
//                                         <div className="overflow-hidden">
//                                             <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                                                 {selectedTransactions.map(tx => (
//                                                     <div 
//                                                         key={tx._id} 
//                                                         className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                                                     >
//                                                         <div className="px-4 py-3">
//                                                             <div className="flex justify-between items-center mb-1">
//                                                                 <span className="font-medium text-gray-900 dark:text-gray-100">
//                                                                     {tx.merchant_name}
//                                                                 </span>
//                                                                 <span className={`font-medium ${
//                                                                     tx.transaction_type === 'expense' 
//                                                                         ? 'text-red-600 dark:text-red-400' 
//                                                                         : 'text-green-600 dark:text-green-400'
//                                                                 }`}>
//                                                                     {tx.transaction_type === 'expense' ? '-' : '+'}
//                                                                     {formatAmount(tx.transaction_amount)}원
//                                                                 </span>
//                                                             </div>
//                                                             <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <span>{formatDate(tx.transaction_date)}</span>
//                                                                     {tx.menu_name && (
//                                                                         <span className="text-gray-400 dark:text-gray-500">
//                                                                             {tx.menu_name}
//                                                                         </span>
//                                                                     )}
//                                                                 </div>
//                                                                 <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
//                                                                     {tx.expense_type}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     <div className="p-4 border-t border-gray-200 dark:border-gray-700">
//                         <button
//                             type="button"
//                             onClick={handleClose} 
//                             className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                         >
//                             닫기
//                         </button>
//                     </div>
//                 </div>
//             </Drawer>
//         </>
//     );
// };

const CardDetail = ({ card, teamMembersCount, remainingDays, isOvertimeMealCard }) => {
    const [selectedTransactions, setSelectedTransactions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');
    const [lLoading, setLoading] = useState(false);

    const totalBalance = card.balance + card.rollover_amount;
    const remainingBalanceCriteria = totalBalance / teamMembersCount > 10000;
    const isWarning = !isOvertimeMealCard && remainingBalanceCriteria && remainingDays <= 7;
    const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;
    const isMobile = useMediaQuery("(max-width: 640px)");
    const drawerSize = isMobile ? "100%" : "375px";

    const handleClick = async (cardId) => {
        try {
            setIsOpen(true);
            setLoading(true);
            const response = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
            setSelectedTransactions(response.data);
        } catch (error) {
            console.error("거래내역 조회 중 오류가 발생했습니다:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: format(date, 'MM월 dd일'),
            time: format(date, 'HH:mm')
        };
    }

    const formatAmount = (amount) => {
        return amount.toLocaleString();
    }

    const getExpenseType = (type) => {
        return type === 'TeamFund' ? '팀운영비 지출' : '지출';
    }

    const groupTransactionsByDate = (transactions) => {
        return transactions.reduce((groups, transaction) => {
            const date = format(new Date(transaction.transaction_date), 'yyyy-MM-dd');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
        }, {});
    }

    return (
        <>
            <div className="mb-10" onClick={() => handleClick(card.card_id)}>
                <div className="flex justify-between mb-4">
                    <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                        <span className="text-lg font-bold dark:text-slate-400">
                            {isOvertimeMealCard ? "야근 식대" : card.member_name}
                        </span>
                        {!isOvertimeMealCard && <span className="text-base">{card.position}</span>}
                    </h3>
                    <span className="text-lg">
                        <span className={`font-bold dark:text-slate-400 ${
                            isWarning ? 'text-red-500 dark:text-red-700' : 'text-green-600 dark:text-green-400'
                        }`}>
                            {totalBalance.toLocaleString()}원
                        </span>
                        {totalBalance > 0 && <span className="dark:text-slate-500"> 남음</span>}
                    </span>
                </div>
                <ProgressBars spentPercentage={spentPercentage} isWarning={isWarning} />
            </div>

            <Drawer open={isOpen} duration="300" direction="right" size={drawerSize}>
                <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center w-full h-14 px-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                        <h1 className="font-medium text-lg text-gray-900 dark:text-white">거래내역</h1>
                        <button 
                            onClick={handleClose} 
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                        >
                            <MdClose className="text-xl text-gray-600 dark:text-gray-400"/>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {selectedTransactions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                거래내역이 없습니다.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {Object.entries(groupTransactionsByDate(selectedTransactions)).map(([date, transactions]) => (
                                    <div key={date} className="bg-white dark:bg-gray-800">
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatDate(date).date}
                                            </span>
                                        </div>
                                        {transactions.map(tx => (
                                            <div 
                                                key={tx._id} 
                                                className="px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {tx.merchant_name}
                                                            </span>
                                                            <span className="text-md font-medium text-gray-900 dark:text-gray-100">
                                                                {formatAmount(tx.transaction_amount)}원
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(tx.transaction_date).time}
                                                            </span>
                                                            {tx.menu_name && (
                                                                <span className="text-sm text-gray-400">
                                                                    • {tx.menu_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                        {getExpenseType(tx.expense_card)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose} 
                            className="w-full py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default Teams;
