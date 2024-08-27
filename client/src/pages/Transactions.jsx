import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

const CARD_URL = '/api/cards';
const TRANSACTION_URL = '/api/transactions';

const Transactions = () => {
    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
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

    // 카드와 트랜잭션 데이터 가져오기
    const fetchCards = async () => {
        try {
            const response = await axios.get(CARD_URL);
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    // const fetchTransactions = async () => {
    //     try {
    //         const response = await axios.get(TRANSACTION_URL);
    //         setTransactions(response.data);
    //     } catch (error) {
    //         console.error('Error fetching transactions:', error);
    //     }
    // }

    const fetchTransactionsForCurrentMonth = async () => {
        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
    
            const response = await axios.get(`${TRANSACTION_URL}/${year}/${month}`);
            
            // 날짜 기준으로 최신순 정렬 (transaction_date 내림차순)
            const sortedTransactions = response.data.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
            
            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Error fetching transactions for the current month:', error);
        }
    }
    

    useEffect(() => {
        fetchTransactionsForCurrentMonth();
        fetchCards();
    }, []);

    // 사용자의 카드만 필터링
    useEffect(() => {
        if (cards.length > 0 && user) {
            // 사용자(member_id)가 소유한 카드만 필터링
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
            transaction_amount: ""
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleCardChange = (e) => {
        setSelectedTransaction({
            ...selectedTransaction,
            card_id: e.target.value
        });
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedTransaction({
            card_id: userCards[0]?._id || "",
            transaction_date: new Date().toISOString().split('T')[0],
            merchant_name: "",
            menu_name: "",
            transaction_amount: ""
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
            const transactionData = {
                card_id: selectedTransaction.card_id || userCards[0]._id,
                transaction_date: selectedTransaction.transaction_date,
                merchant_name: selectedTransaction.merchant_name,
                menu_name: selectedTransaction.menu_name,
                transaction_amount: selectedTransaction.transaction_amount
            };

            await saveTransaction(transactionData);
            await fetchTransactionsForCurrentMonth();
            handleCloseDrawer();
        } catch (error) {
            console.error("Error saving transaction:", error);
        }
    }

    return (
        <>
            <div className='w-full h-full p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">카드 사용 내역</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl'
                        onClick={handleAddTransaction}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root'>
                    {transactions.length === 0 ? (
                        <div className="flex justify-center items-center h-[calc(100vh-204px)] text-gray-500 dark:text-gray-400">
                            데이터가 없습니다.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map(transaction => (
                            <li key={transaction._id} onClick={() => handleOpenDrawer(transaction)}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-400 overflow-hidden flex items-center justify-center">
                                        <span className="text-white text-lg font-semibold">
                                            {transaction.merchant_name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 ms-4">
                                            <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                {transaction.merchant_name} 
                                            </p>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                {transaction.transaction_date}
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            {transaction.transaction_amount}
                                        </div>
                                </div>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>

                <CommonDrawer
                    isOpen={isOpen}
                    onClose={toggleDrawer}
                    title={isEditing ? '카드 사용 수정' : '카드 사용 추가'}
                >
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
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
                            value={selectedTransaction?.transaction_date || ""}
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
