import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance"; 
import FlipCard from '../components/FlipCard';
import { MdOutlinePayment } from "react-icons/md";
import { TbPigMoney } from "react-icons/tb";
import { MutatingDots } from 'react-loader-spinner';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import TransactionDrawer from '../components/TransactionDrawer';
import HeaderWithTabs from '../components/HeaderWithTabs';
import DateFilter from '../components/DateFilter';
import SearchFilter from '../components/SearchFilter';

const Transactions = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [depositType, setDepositType] = useState('');
    const [expenseType, setExpenseType] = useState('RegularExpense'); // 기본값: 일반 지출
    const [cardBalance, setCardBalance] = useState(0);
    const [teamFund, setTeamFund] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState({
        card_id: "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_items: [],
        transaction_amount: 0,
        transaction_type: "expense",
        expense_card: "TeamCard",
        expense_type: "RegularExpense",
        rolloverAmounted: 0,
        teamFundDeducted: 0,
        is_deducted: false,        
    });
    const [prevTransaction, setPrevTransaction] = useState(0);
    const [selectedCardId, setSelectedCardId] = useState(''); // 현재 선택된 카드 ID
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userCards, setUserCards] = useState([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const tabs = [
        { path: '/transactions', label: '지출 내역', title: '내카드' },
        { path: '/teams', label: '계좌 잔액', title: '팀계좌 현황' },
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;

                setSelectedYear(year);
                setSelectedMonth(month);

                const [cardsResponse] = await Promise.all([
                    axios.get(API_URLS.CARDS),
                    fetchTransactionsForMonth(year, month)
                ]);
    
                const fetchedCards = cardsResponse.data;
                setCards(fetchedCards);
    
                if (fetchedCards.length > 0) {
                    const filteredCards = fetchedCards.filter(card => card.member_id._id === user.member_id);
                    setUserCards(filteredCards);
    
                    // 첫 번째 카드 설정
                    if (filteredCards.length > 0) {
                        const initialCard = filteredCards[0];
                        setSelectedCardId(initialCard._id);
                        setCardBalance(initialCard.balance);
                        setTeamFund(initialCard.team_fund);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchInitialData();
    }, []); 
    
    const fetchTransactionsForMonth = async (year, month) => {
        setIsLoading(true);
        try {
            const monthParam = month === -1 ? 'all' : month;
            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${year}/${monthParam}`);
            
            const sortedTransactions = response.data.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                
                // transaction_date 기준으로 정렬
                if (dateA - dateB !== 0) {
                    return dateB - dateA;
                }
                
                // transaction_date가 같을 경우 createdAt 기준으로 정렬
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            setTransactions(sortedTransactions);

        } catch (error) {
            console.error('Error fetching transactions for the selected month:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // 카드 선택 시 필터링된 트랜잭션 업데이트
    useEffect(() => {
        if (selectedCardId) {
            const updatedTransactions = transactions.filter(
                tx => tx.card_id._id === selectedCardId
            );
            setFilteredTransactions(updatedTransactions);
        } else {
            setFilteredTransactions(transactions);
        }
    }, [selectedCardId, transactions]);

    // 카드와 트랜잭션 데이터 가져오기
    const fetchCards = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_URLS.CARDS);
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (selectedCardId) {
            const updatedBalance = calculateBalance(selectedCardId, selectedYear, selectedMonth);
            console.log('updatedBalance', updatedBalance);
            setCardBalance(updatedBalance);
        }
    }, [selectedCardId, selectedYear, selectedMonth, transactions]);
    
    const resetTransaction = () => ({
        card_id: userCards[0]?._id || "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_name: "",
        transaction_amount: 0,
        balance: 0,
    });

    const handleSearchTermChange = async (term) => {
        try {
            if (term) {
                const year = selectedYear;
                const month = selectedMonth;

                const response = await axios.get(`${API_URLS.TRANSACTIONS}/search/all/${term}`, {
                    params: {
                        year: year,
                        month: month
                    }
                });
                const searchResults = response.data;

                setFilteredTransactions(searchResults);
            }
        } catch (error) {
            console.error('검색 오류:', error);
        }
    };

    const handleSelectedDate = (date) => {
        fetchTransactionsForMonth(date.year, date.month);
        setSelectedYear(date.year);
        setSelectedMonth(date.month);
    }
    
    const handleCloseDrawer = useCallback(() => {
        setIsOpen(false);
        setSelectedTransaction(resetTransaction());
    }, []);
    

    const handleOpenDrawer = (transaction) => {
        const selectedCard = cards.find(card => card._id === transaction.card_id?._id);

        setPrevTransaction(transaction);
        setSelectedTransaction({
            ...transaction,
            transaction_date: transaction.transaction_date.split('T')[0],
            card_id: selectedCard._id,
            balance: selectedCard.balance,
        });

        setExpenseType(transaction.expense_type || 'RegularExpense');

        if (transaction.transaction_type === 'expense') {
            setDepositType(""); 
        } else {
            setDepositType(transaction.deposit_type || "RegularDeposit");
        }
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleError = (error) => {
        if (error.response) {
            return error.response.data.message || "오류가 발생했습니다.";
        } else if (error.message) {
            return error.message || "오류가 발생했습니다.";
        } else if (error.request) {
            return "서버로부터 응답을 받지 못했습니다. 네트워크 문제일 수 있습니다.";
        } else {
            return "알 수 없는 오류가 발생했습니다.";
        }
    };

    const handleSave = async (updatedTransaction) => {
        try {
            setErrMsg('');

            const transactionData = {
                card_id: updatedTransaction.card_id,
                transaction_date: updatedTransaction.transaction_date,
                merchant_name: updatedTransaction.merchant_name,
                menu_items: updatedTransaction.menu_items,
                transaction_type: "expense",
                expense_card: updatedTransaction.expense_card,
                expense_type: updatedTransaction.expense_type,
                is_deducted: false,
                transaction_amount: updatedTransaction.menu_items.reduce((sum, item) => 
                    sum + (Number(item.price) * Number(item.quantity)), 0)
            };

            if (isEditing) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }

            await fetchTransactionsForMonth(selectedYear, selectedMonth);
            await fetchCards();
            handleCloseDrawer();

        } catch (error) {
            const errorMsg = handleError(error);
            console.log('errorMsg', errorMsg);
            setErrMsg(errorMsg);
        }
    };
    

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
            await fetchTransactionsForMonth(selectedYear, selectedMonth);
            await fetchCards();
    
            setIsDeleteConfirmOpen(false);
            handleCloseDrawer();
        } catch (error) {
            const errorMsg = handleError(error);
            console.log('errorMsg', errorMsg);
            setErrMsg(errorMsg);
        }
    };

    const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
        if (!acc[transactionDate]) {
            acc[transactionDate] = [];
        }
        acc[transactionDate].push(transaction);
        return acc;
    }, {});
    
    const userCardsWithTotals = userCards.map(card => {
        const totalSpent = transactions
            .filter(tx => tx.card_id._id === card._id && tx.transaction_type === 'expense' && !tx.is_deducted)
            .reduce((sum, tx) => sum + Number(tx.transaction_amount), 0);
    
        return {
            ...card,
            totalSpent
        };
    });

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        beforeChange: (current, next) => {
            const roundedNext = Math.round(next);
            const nextCardId = userCardsWithTotals[roundedNext]?._id;
    
            if (nextCardId) {
                setSelectedCardId(nextCardId);
            }
        },
    };

    const calculateBalance = (cardId, year, month) => {
        const filteredTransactions = transactions.filter(
            (tx) => tx.card_id._id === cardId && 
                    new Date(tx.transaction_date).getFullYear() === Number(year) && 
                    new Date(tx.transaction_date).getMonth() + 1 === Number(month)
        );

        const totalDeposits = filteredTransactions
            .filter(tx => tx.transaction_type === 'income')
            .reduce((sum, tx) => sum + tx.transaction_amount, 0);
    
        const totalExpenses = filteredTransactions
            .filter(tx => tx.transaction_type === 'expense')  // && !tx.is_deducted
            .reduce((sum, tx) => sum + tx.transaction_amount, 0);
    
        return totalDeposits - totalExpenses;
    };
    
    return (
        <>
            <HeaderWithTabs tabs={tabs} />

            <div className='flex-1 w-full p-4'>
                <div className='mb-8'>
                { userCardsWithTotals.length === 0 ? (
                    <FlipCard
                    key='no'
                    userName={user.name}
                    cardNumber='카드 정보 없음'
                    totalSpent={0}
                    currentBalance={0}
                    rolloverAmount={0}
                    />
                    ) : (
                        isLoading ? ( 
                            <div className="flex flex-col items-center justify-center">
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
                        </div>
                        ) : (
                            <Slider {...sliderSettings}>
                                {userCardsWithTotals.map(card => {
                                    // const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0) + (card.team_fund || 0); // 이월 금액 포함한 잔액 계산
                                    return (
                                        <FlipCard
                                            key={card._id} 
                                            userName={user.name}
                                            cardNumber={card.card_number}
                                            totalSpent={Number(card.totalSpent)}
                                            currentBalance={cardBalance}
                                            rolloverAmount={Number(card.rollover_amount)}
                                        />
                                    );
                                })}
                            </Slider>
                        )
                    )
                }
                </div>

                {/* 트랜잭션 목록 */}
                <div className='flow-root pb-20'>                  
                    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-800 dark:border dark:border-slate-700">

                        <div className="flex items-center justify-between mb-4">
                            <DateFilter onDateSelect={handleSelectedDate} title="지출기간 선택" className={isSearchActive ? 'w-10' : ''} />
                            <SearchFilter onSearchStateChange={setIsSearchActive} onSearchTermChange={handleSearchTermChange} />
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
                                {/* 로딩 스켈레톤 컴포넌트 추가 가능 */}
                            </div>
                        ) : Object.keys(groupedTransactions).length === 0 ? (
                            <div className="flex justify-center items-center min-h-card-screen text-gray-500 dark:text-gray-400">
                                데이터가 없습니다.
                            </div>
                        ) : (
                            <ul role="list">
                                {Object.entries(groupedTransactions).map(([date, transactions]) => (
                                    <li key={date} className="py-3 cursor-pointer">
                                        <div>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                {date}
                                            </p>
                                        </div>
                                        {transactions.map((transaction) => (
                                            <div key={transaction._id} onClick={ transaction.transaction_type !== "income" ? () => handleOpenDrawer(transaction) : null} className="rounded-lg active:scale-99 active:px-2 active:bg-slate-50 dark:active:bg-slate-600">
                                                <div className="flex items-center py-2">
                                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full border bg-white overflow-hidden flex items-center justify-center ${transaction.transaction_type !== 'income' ? 'border-red-600' : 'border-green-600'}`}>
                                                        <span className="text-slate-500 text-lg font-normal">
                                                            {transaction.transaction_type !== "income" ? ( <MdOutlinePayment className='text-2xl text-red-600' /> ) : (<TbPigMoney className='text-2xl text-green-500' />)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 ms-4">
                                                        <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                            {transaction.merchant_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                            {transaction.menu_items?.length > 0 
                                                                ? transaction.menu_items.map(item => item.name).join(', ')
                                                                : `비씨카드(${transaction.card_id.card_number.split('-').reverse()[0]})`
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="inline-flex flex-col gap-x-3 items-center">
                                                        <span className='font-semibold text-base text-gray-900 dark:text-white'>
                                                            {transaction.transaction_amount.toLocaleString()}원
                                                        </span>
                                                        <span className='inline-block w-full text-sm text-right text-gray-400'>
                                                            {transaction.transaction_type === 'expense' ? '지출' : '입금'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                
                {/* 트랜잭션 드로어 컴포넌트 */}
                <TransactionDrawer
                    isOpen={isOpen}
                    onClose={handleCloseDrawer}
                    onSave={handleSave}
                    userCards={userCards} // 카드 정보
                    isEditing={isEditing} // 트랜잭션 수정 모드가 아님
                    transactionData={selectedTransaction} // 새로운 트랜잭션 데이터
                    errMsg={errMsg} // 에러 메시지
                    cardBalance={cardBalance} // 카드 잔액 (롤오버 금액과 팀 펀드를 포함한 잔액)
                    teamFund={teamFund || 0} // 팀 펀드 (부모에서 전달)
                    onDelete={handleDelete} 
                />
            </div>
        </>
    );
}

export default Transactions;
