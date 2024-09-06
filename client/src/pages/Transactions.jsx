import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdOutlinePayment } from "react-icons/md";
import { TbPigMoney } from "react-icons/tb";

const CARDS_URL = '/api/cards';
const TRANSACTION_URL = '/api/transactions';

const Transactions = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    // const [balance, setBalance] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState({
        card_id: "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_name: "",
        transaction_amount: ""
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userCards, setUserCards] = useState([]);

    useEffect(() => {
        setErrMsg('');
    }, [transactions])


    // 카드와 트랜잭션 데이터 가져오기
    const fetchCards = async () => {
        try {
            const response = await axios.get(CARDS_URL);
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    const fetchTransactionsForCurrentMonth = async () => {
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
    
            const response = await axios.get(`${TRANSACTION_URL}/${year}/${month}`);
            const sortedTransactions = response.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Error fetching transactions for the current month:', error);
        }
    }
    
    useEffect(() => {
        console.log('Fetching transactions...');
        fetchTransactionsForCurrentMonth();
        fetchCards();
    }, []);

    // 사용자의 카드만 필터링
    useEffect(() => {
        if (cards.length > 0 && user) {
            const filteredCards = cards.filter(card => card.member_id._id === user.member_id);
            setUserCards(filteredCards);
        }
    }, [cards, user]);

    // 트랜잭션 초기 상태 설정
    useEffect(() => {
        if (userCards.length > 0) {
            setSelectedTransaction(prev => ({ ...prev, card_id: userCards[0]._id }));
        }
    }, [userCards]);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const handleOpenDrawer = (transaction) => {
        setSelectedTransaction(transaction);
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleAddTransaction = () => {
        setSelectedTransaction({
            card_id: userCards[0]?._id || "",
            transaction_date: new Date().toISOString().split('T')[0],
            merchant_name: "",
            menu_name: "",
            transaction_amount: "",
            transaction_type: "지출"
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleCardChange = (e) => {
        setSelectedTransaction({
            ...selectedTransaction,
            card_id: e.target.value,
        });
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedTransaction({
            card_id: userCards[0]?._id || "",
            transaction_date: new Date().toISOString().split('T')[0],
            merchant_name: "",
            menu_name: "",
            transaction_amount: "",
            transaction_type: ""
        });
    };

    const saveTransaction = async (transactionData) => {
        if (isEditing) {
            await axios.put(`${TRANSACTION_URL}/${selectedTransaction._id}`, transactionData);
            console.log("Transaction updated successfully:", transactionData);
        } else {
            await axios.post(TRANSACTION_URL, transactionData);
            console.log("Transaction added successfully:", transactionData);
        }
    }

    const handleSave = async () => {
        try {
            setErrMsg('');
            
            const transactionData = {
                card_id: selectedTransaction.card_id || userCards[0]._id,
                transaction_date: selectedTransaction.transaction_date,
                merchant_name: selectedTransaction.merchant_name,
                menu_name: selectedTransaction.menu_name,
                transaction_amount: selectedTransaction.transaction_amount,
                transaction_type: "지출"
            };
    
            const card = cards.find(card => card._id === selectedTransaction.card_id || userCards[0]._id);
            if (!card) {
                throw new Error("해당 카드를 찾을 수 없습니다.");
            }
    
            // 트랜잭션 수정 시 기존 금액과 새로운 금액의 차액 계산
            const previousAmount = isEditing ? transactions.find(t => t._id === selectedTransaction._id)?.transaction_amount : 0;
            const newAmount = selectedTransaction.transaction_amount;
            const amountDifference = newAmount - previousAmount;  // 차액 계산
    
            // 트랜잭션 저장
            await saveTransaction(transactionData);
    
            // 카드 잔액 업데이트 (차액만큼 업데이트)
            await updateCardBalance(selectedTransaction.card_id, amountDifference);
    
            await fetchTransactionsForCurrentMonth();
            handleCloseDrawer();
        } catch (error) {
            // error 객체의 response가 있는지 먼저 확인
            if (error.response) {
                const errorMessage = error.response.data.error || "오류가 발생했습니다.";
                setErrMsg(errorMessage);
            } else if (error.request) {
                setErrMsg("서버로부터 응답을 받지 못했습니다. 네트워크 문제일 수 있습니다.");
            } else {
                setErrMsg(error.message || "알 수 없는 오류가 발생했습니다.");
            }
        }
    }
    
    
    const updateCardBalance = async (card_id, amountDifference) => {
        try {
            // card_id와 cards 배열이 제대로 초기화되어 있는지 확인
            if (!card_id || cards.length === 0) {
                throw new Error("카드 정보를 찾을 수 없습니다.");
            }
    
            const card = cards.find(c => c._id === card_id);
            
            if (!card) {
                throw new Error("해당 카드를 찾을 수 없습니다.");
            }
    
            const newBalance = card.balance - amountDifference;
            
            // 서버에 카드의 잔액 업데이트 요청
            await axios.put(`${CARDS_URL}/${card_id}`, { balance: newBalance });
            
            console.log('카드 잔액 업데이트 성공:', newBalance);
        } catch (error) {
            console.error('카드 잔액 업데이트 실패:', error);
            setErrMsg(error.message || "카드 잔액을 업데이트할 수 없습니다.");
        }
    }
    

    // 카드별로 남은 한도 계산 함수
    const calculateRemainingBalance = (card, transactions) => {
        const totalSpent = transactions
            .filter(tx => tx.card_id._id === card._id && tx.transaction_type === '지출')
            .reduce((sum, tx) => sum + Number(tx.transaction_amount), 0);
    
        const balance = card.balance; // 잔액 표시
        return {
            totalSpent,
            balance
        };
    };
    

    const groupedTransactions = transactions.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
        if (!acc[transactionDate]) {
            acc[transactionDate] = [];
        }
        acc[transactionDate].push(transaction);
        return acc;
    }, {});

    return (
        <>
            <div className='w-full p-4 sm:p-6 dark:bg-gray-800'>
                {/* 카드 한도와 남은 금액 표시 */}
                <div className="space-y-4 mb-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
                    <h5 className="text-md font-semibold leading-none text-gray-500 dark:text-white">카드정보</h5>
                    {userCards.map(card => {
                        const calculate = calculateRemainingBalance(card, transactions);

                        return (
                            <div key={card._id} className="">
                                <h6 className="text-gray-900 dark:text-white">카드 번호: {card.card_number}</h6>
                                <p className="text-gray-700 dark:text-gray-400">지출 금액: {calculate.totalSpent.toLocaleString()} 원</p>
                                <p className={`font-semibold ${card.balance <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    잔여 금액: {card.balance.toLocaleString()} 원
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* 트랜잭션 목록 */}
                <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-md font-semibold leading-none text-gray-500 dark:text-white">카드 사용 내역</h5>
                        <button
                            type="button" 
                            className='text-black font-semibold rounded-lg text-2xl'
                            onClick={handleAddTransaction}
                        ><IoAddCircleOutline /></button>
                    </div>
                    <div className='flow-root'>
                        {Object.keys(groupedTransactions).length === 0 ? (
                            <div className="flex justify-center items-center min-h-[calc(100vh-47vh)] text-gray-500 dark:text-gray-400">
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
                                            <div key={transaction._id} onClick={ transaction.transaction_type !== "입금" ? () => handleOpenDrawer(transaction) : null} className="active:bg-slate-50">
                                                <div className="flex items-center py-2">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full border bg-white overflow-hidden flex items-center justify-center">
                                                        <span className="text-slate-500 text-lg font-normal">
                                                            {transaction.transaction_type !== "입금" ? ( <MdOutlinePayment className='text-2xl text-red-600' /> ) : (<TbPigMoney className='text-2xl text-green-500' />)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 ms-4">
                                                        <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                            {transaction.merchant_name} {transaction.transaction_type}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                            {transaction.menu_name === '' ? `비씨카드(${transaction.card_id.card_number.split('-').reverse()[0]})` : transaction.menu_name }
                                                        </p>
                                                    </div>
                                                    <div className="inline-flex gap-x-3 items-center text-base font-semibold text-gray-900 dark:text-white">
                                                        <span>
                                                            {transaction.transaction_amount.toLocaleString()}원
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
                <CommonDrawer
                    isOpen={isOpen}
                    onClose={toggleDrawer}
                    title={isEditing ? '카드 사용 수정' : '카드 사용 추가'}
                >

                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                        {errMsg && <div className="text-red-600">{errMsg}</div>} {/* 에러 메시지 표시 */}
                        <InputField 
                            label="상호명" 
                            id="merchant_name" 
                            value={selectedTransaction?.merchant_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, merchant_name: e.target.value })}
                            placeholder="상호명 입력"
                            required={true}
                        />
                        <InputField 
                            label="지출금액" 
                            id="transaction_amount"
                            type="number"
                            value={selectedTransaction?.transaction_amount || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, transaction_amount: e.target.value })}
                            placeholder="지출금액 입력"
                            required={true}
                        />
                        <InputField 
                            label="거래일" 
                            id="transaction_date" 
                            type='date'
                            value={selectedTransaction?.transaction_date.split("T")[0] || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, transaction_date: e.target.value })}
                            placeholder=""
                            required={true}
                        />
                        <InputField 
                            label="메뉴명" 
                            id="menu_name" 
                            value={selectedTransaction?.menu_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, menu_name: e.target.value })}
                            placeholder="메뉴명(옵션) 입력"
                        />
                        <div className="flex flex-col gap-2">
                            <label htmlFor="card_id">사용 카드</label>
                            <select
                                id="card_id"
                                name="card_id"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={selectedTransaction?.card_id || ""}
                                onChange={handleCardChange}
                            >
                                <option value="" disabled>카드 선택</option>
                                {userCards.map(card => (
                                    <option key={card._id} value={card._id}>
                                        {card.card_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6">
                        <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                            {isEditing ? '수정' : '등록'}
                        </button>
                        <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                            안할래요
                        </button>
                    </div>
                </CommonDrawer>
            </div>
        </>
    );
}

export default Transactions;
