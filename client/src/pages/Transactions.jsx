import React, { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import FlipCard from '../components/FlipCard';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import { MdOutlinePayment } from "react-icons/md";
import { TbPigMoney } from "react-icons/tb";
import { MutatingDots } from 'react-loader-spinner';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import TransactionDrawer from '../components/TransactionDrawer';

const Transactions = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [depositType, setDepositType] = useState('');
    const [expenseCard, setExpenseCard] = useState('TeamCard'); // 기본값: 팀카드
    const [expenseType, setExpenseType] = useState('RegularExpense'); // 기본값: 일반 지출
    const expenceCardRef = useRef(null);
    // const expenceTypeRef = useRef(null);
    const expenceMerchantRef = useRef(null);
    const [cardBalance, setCardBalance] = useState(0);
    const [teamFund, setTeamFund] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState({
        card_id: "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_name: "",
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

    useEffect(() => {
        if (expenceCardRef.current) {
            expenceMerchantRef.current.focus(); 
        }
    }, [expenseCard]);
    
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

    const fetchTransactionsForCurrentMonth = async () => {
        setIsLoading(true);

        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함

            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${year}/${month}`);
            const sortedTransactions = response.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Error fetching transactions for the current month:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactionsForCurrentMonth();
        fetchCards();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && user) {
            // 현재 사용자의 카드만 필터링
            const filteredCards = cards.filter(card => card.member_id._id === user.member_id);
            setUserCards(filteredCards);
    
            // 첫 번째 카드 기본 선택
            if (filteredCards.length > 0) {
                setSelectedCardId(filteredCards[0]._id); // 첫 카드 ID로 설정
                setCardBalance(filteredCards[0].balance);
                setTeamFund(filteredCards[0].team_fund);
            }
        }
    }, [cards, user]);

    // 카드 선택 시 트랜잭션 필터링
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

    useEffect(() => {
        if (userCards.length > 0) {
            const initialCardId = userCards[0]._id;
            setSelectedCardId(initialCardId);
        }
    }, [userCards]);

    const resetTransaction = () => ({
        card_id: userCards[0]?._id || "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_name: "",
        transaction_amount: 0,
        balance: 0,
    });

    const getCardExpenseType = (card) => {
        const isOvertimeMealCard = card.card_type === 'OvertimeMealCard';
        return {
            expense_card: isOvertimeMealCard ? 'OvertimeMealCard' : 'TeamCard',
            expense_type: isOvertimeMealCard ? 'OvertimeMealExpense' : cardBalance > 0 ? 'RegularExpense' : 'TeamFund',
        };
    };

    const getCardBalances = (card) => ({
        balance: card.balance || 0, // 카드 잔액
        team_fund: card.team_fund || 0, // 팀 운영비 잔액
    });

    const handleAddTransaction = () => {
        const activeCard = userCardsWithTotals.find(card => card._id === selectedCardId);
    
        if (!activeCard) {
            console.error("활성 카드를 찾을 수 없습니다.");
            return;
        }
    
        const { expense_card, expense_type } = getCardExpenseType(activeCard);
        const { balance, team_fund } = getCardBalances(activeCard);
    
        setSelectedTransaction({
            ...selectedTransaction,
            card_id: selectedCardId,
            card_number: activeCard.card_number || "",
            balance,
            team_fund,
            expense_card,
            expense_type,
        });
        setIsEditing(false);
        setIsOpen(true);

    };
    
    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedTransaction(resetTransaction());
    };
    

    const handleOpenDrawer = (transaction) => {
        const selectedCard = cards.find(card => card._id === transaction.card_id._id);
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
                menu_name: updatedTransaction.menu_name,
                transaction_type: "expense",
                expense_card: updatedTransaction.expense_card,
                expense_type: updatedTransaction.expense_type,
                transaction_amount: updatedTransaction.transaction_amount,
                is_deducted: false,
            };
    
            const originalAmount = Number(prevTransaction.transaction_amount);
            const currentAmount = Number(updatedTransaction.transaction_amount);
    
            if (originalAmount !== currentAmount) {
                transactionData.transaction_amount = currentAmount;
            }
    
            if (isEditing) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }
    
            await fetchTransactionsForCurrentMonth();
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
            // 서버에 트랜잭션 삭제 요청
            await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
    
            // 거래 내역 갱신
            await fetchTransactionsForCurrentMonth();
            await fetchCards();
    
            // 삭제 확인 모달 닫기
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
    
    
    return (
        <>
            <header className={`flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>내 카드</span>
                </div>
            </header>

            <div className='flex-1 w-full p-4'>
                <div className='mb-8'>
                { userCardsWithTotals.length === 0 ? (
                    <FlipCard
                    key='no'
                    userName={user.name}
                    cardNumber='미발급 상태'
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
                                    const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0) + (card.team_fund || 0); // 이월 금액 포함한 잔액 계산
                                    return (
                                        <FlipCard
                                            key={card._id} 
                                            userName={user.name}
                                            cardNumber={card.card_number}
                                            totalSpent={Number(card.totalSpent)}
                                            currentBalance={currentBalanceWithRollover}
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
                <div className='flow-root'>                  
                    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-800 dark:border dark:border-slate-700">

                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold leading-none text-gray-500 dark:text-white">지출 내역</h5>
                            <button
                                type="button" 
                                className='flex items-center gap-x-2 text-gray-500 font-semibold rounded-lg text-3xl dark:text-white'
                                onClick={handleAddTransaction}
                            ><IoAddCircleOutline /></button>
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
                                                            {transaction.menu_name === '' ? `비씨카드(${transaction.card_id.card_number.split('-').reverse()[0]})` : transaction.menu_name }
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
