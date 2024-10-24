import React, { useEffect, useRef, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { API_URLS } from '../services/apiUrls';
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Card from '../components/Card';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import { MdOutlinePayment } from "react-icons/md";
import { TbPigMoney } from "react-icons/tb";

const calculateAvailableBalance = (card) => {
    return Number(card.balance) + Number(card.rollover_amount) + Number(card.team_fund);
};

const Transactions = () => {

    const { user } = useContext(AuthContext);
    const [cards, setCards] = useState([]);
    const [depositType, setDepositType] = useState('');
    const [expenceType, setExpenceType] = useState('TeamCard');
    const expenceTypeRef = useRef(null);
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
        transaction_amount: "",
        transaction_type: "",
        expense_type: "",
        rolloverAmounted: "",
        teamFundDeducted: "",        
    });
    const [prevTransaction, setPrevTransaction] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [userCards, setUserCards] = useState([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    useEffect(() => {
        if (expenceTypeRef.current) {
            expenceMerchantRef.current.focus(); 
        }
    }, [expenceType]);
    
    useEffect(() => {
        setErrMsg('');
    }, [transactions.length])


    // 카드와 트랜잭션 데이터 가져오기
    const fetchCards = async () => {
        try {
            const response = await axios.get(API_URLS.CARDS);
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

            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${year}/${month}`);
            const sortedTransactions = response.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

            setTransactions(sortedTransactions);
        } catch (error) {
            console.error('Error fetching transactions for the current month:', error);
        }
    };

    // const fetchSelectedTransaction = async () => {
    //     try {
    //         const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
    //         const prevTransaction = response.data;
    //         setPrevTransaction(prevTransaction);
    //     } catch (error) {
    //         console.error('Error fetching transactions for the current month:', error);
    //     }
    // }

    useEffect(() => {
        fetchTransactionsForCurrentMonth();
        fetchCards();
    }, []);

    useEffect(() => {
        if (cards.length > 0 && user) {
            const filteredCards = cards.filter(card => card.member_id._id === user.member_id);
            setUserCards(filteredCards);
            if (filteredCards.length > 0) {
                setSelectedTransaction(prev => ({ ...prev, card_id: filteredCards[0]._id }));
                setCardBalance(filteredCards[0].balance);
                setTeamFund(filteredCards[0].team_fund);
            }
        }
    }, [cards, user]);

    const resetTransaction = () => ({
        card_id: userCards[0]?._id || "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        menu_name: "",
        transaction_amount: ""
    });
    
    const handleAddTransaction = () => {
        setSelectedTransaction(resetTransaction());
        setIsEditing(false);
        setIsOpen(true);
    };
    
    const handleCloseDrawer = () => {
        console.log('Closing drawer');
        setIsOpen(false);
        setSelectedTransaction(resetTransaction());
    };
    

    const handleOpenDrawer = (transaction) => {

        setPrevTransaction(transaction);

        setSelectedTransaction({
            ...transaction,
            card_id: transaction.card_id._id ? transaction.card_id : transaction.card_id // 카드 ID가 객체인 경우 문자열로 변환
        });

        setExpenceType(transaction.expense_type || '');
        
        // 거래 타입에 따라 depositType 설정
        if (transaction.transaction_type === 'expense') {
            // 지출의 경우 depositType을 설정하지 않거나 특정 값으로 초기화
            setDepositType(""); // 혹은 원하는 초기값
        } else {
            // 입금의 경우 deposit_type 값을 설정
            setDepositType(transaction.deposit_type || "RegularDeposit");
        }
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleCardChange = (e) => {
        const cardId = e.target.value;
        setSelectedTransaction({
            ...selectedTransaction,
            card_id: cardId,
        });
    };

    // 트랜잭션 수정 시 카드 ID 확인 및 처리
    const getCardId = () => {
        if (typeof selectedTransaction.card_id === 'object') {
            return selectedTransaction.card_id._id;
        }
        return selectedTransaction.card_id;
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
    
    // const handleSave = async () => {
    //     try {
    //         setErrMsg('');
    
    //         const cardId = selectedTransaction.card_id._id || userCards[0]._id;
    //         const transactionData = {
    //             card_id: cardId,
    //             transaction_date: selectedTransaction.transaction_date,
    //             merchant_name: selectedTransaction.merchant_name,
    //             menu_name: selectedTransaction.menu_name,
    //             transaction_amount: Number(selectedTransaction.transaction_amount), // 숫자로 변환
    //             transaction_type: "expense",
    //             expense_type: expenceType,
    //         };
    
    //         // 금액이 유효한지 확인 (NaN 체크)
    //         if (isNaN(transactionData.transaction_amount) || transactionData.transaction_amount < 0) {
    //             throw new Error("유효하지 않은 거래 금액입니다.");
    //         }
    
    //         // 카드 정보 가져오기
    //         const cardResponse = await axios.get(`${API_URLS.CARDS}/${cardId}`);
    //         const card = cardResponse.data; // API를 통해 카드 정보 가져오기
    //         if (!card) {
    //             throw new Error("해당 카드를 찾을 수 없습니다.");
    //         }
    
    //         if (selectedTransaction.transaction_type === "income") {
    //             transactionData.deposit_type = selectedTransaction.deposit_type || "AdditionalDeposit";
    //         }
    
    //         // **수정 시에도 잔액 부족 여부 확인**
    //         const availableBalance = calculateAvailableBalance(card);
    //         if (Number(transactionData.transaction_amount) > availableBalance) {
    //             throw new Error(`잔액 부족: 사용 가능한 금액은 ${availableBalance.toLocaleString()}원 입니다.`);
    //         }
    
    //         // 변경 여부 확인 (각 필드가 수정되었는지 확인)
    //         const originalAmount = Number(prevTransaction.transaction_amount); // 원래 금액
    //         const currentAmount = Number(transactionData.transaction_amount); // 현재 입력된 금액
    
    //         const isAmountChanged = currentAmount !== originalAmount;
    //         const isMerchantChanged = transactionData.merchant_name !== prevTransaction.merchant_name;
    //         const isMenuChanged = transactionData.menu_name !== prevTransaction.menu_name;
    //         const isDateChanged = transactionData.transaction_date !== prevTransaction.transaction_date;
    //         const isExpenseTypeChanged = transactionData.expense_type !== prevTransaction.expense_type;
    
    //         console.log('변경 여부 확인:', {
    //             transaction_amount: currentAmount,
    //             selectedTransaction_amount: originalAmount,
    //             isAmountChanged,
    //             isMerchantChanged,
    //             isMenuChanged,
    //             isDateChanged,
    //             isExpenseTypeChanged
    //         });
    
    //         const isTransactionChanged = isAmountChanged || isMerchantChanged || isMenuChanged || isDateChanged || isExpenseTypeChanged;
    
    //         if (!isTransactionChanged) {
    //             console.log("변경된 내용이 없습니다. 저장 요청을 중단합니다.");
    //             handleCloseDrawer(); // 변경 사항이 없으면 드로어만 닫음
    //             return;
    //         }
    
    //         // 트랜잭션 저장
    //         if (isEditing) {
    //             await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
    //             console.log('거래 내역 수정 완료');
    //         } else {
    //             await axios.post(API_URLS.TRANSACTIONS, transactionData);
    //         }
    
    //         await fetchTransactionsForCurrentMonth();
    //         await fetchCards();
    
    //         // 에러가 발생하지 않으면 드로어 닫기
    //         handleCloseDrawer();
    
    //     } catch (error) {
    //         const errorMsg = handleError(error); // 오류 메시지 문자열로 변환
    //         console.log('errorMsg', errorMsg);
    //         setErrMsg(errorMsg); // 문자열로 상태 업데이트
    //     }
    // };

    const handleSave = async () => {
        try {
            setErrMsg('');
    
            const cardId = selectedTransaction.card_id._id || userCards[0]._id;
            const transactionData = {
                card_id: cardId,
                transaction_date: selectedTransaction.transaction_date,
                merchant_name: selectedTransaction.merchant_name,
                menu_name: selectedTransaction.menu_name,
                transaction_amount: Number(selectedTransaction.transaction_amount), // 숫자로 변환
                transaction_type: "expense",
                expense_type: expenceType,
            };
    
            // 금액이 유효한지 확인 (NaN 체크)
            if (isNaN(transactionData.transaction_amount) || transactionData.transaction_amount < 0) {
                throw new Error("유효하지 않은 거래 금액입니다.");
            }
    
            // 카드 정보 가져오기
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${cardId}`);
            const card = cardResponse.data; // API를 통해 카드 정보 가져오기
            if (!card) {
                throw new Error("해당 카드를 찾을 수 없습니다.");
            }
    
            const originalAmount = Number(prevTransaction.transaction_amount); // 기존 트랜잭션 금액
            const currentAmount = Number(transactionData.transaction_amount); // 수정된 금액
            const amountDifference = currentAmount - originalAmount; // 금액 차액
    
            // 차액이 양수면 (기존보다 더 많이 사용) 잔액이 충분한지 확인
            if (amountDifference > 0) {
                const availableBalance = calculateAvailableBalance(card);
                if (amountDifference > availableBalance) {
                    throw new Error(`잔액 부족: 추가로 사용할 수 있는 금액은 ${availableBalance.toLocaleString()}원 입니다.`);
                }
            }
    
            // 차액 반영하여 팀펀드 잔액 수정
            const newTeamFundBalance = card.team_fund - amountDifference;
    
            // 트랜잭션 저장 (수정)
            if (isEditing) {
                console.log('newTeamFundBalance', newTeamFundBalance);
                transactionData.transaction_amount = selectedTransaction.transaction_amount; // 팀펀드 잔액 반영
                console.log('transactionData', transactionData);
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
                console.log('거래 내역 수정 완료');
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }
    
            await fetchTransactionsForCurrentMonth();
            await fetchCards();
    
            // 에러가 발생하지 않으면 드로어 닫기
            handleCloseDrawer();
    
        } catch (error) {
            const errorMsg = handleError(error); // 오류 메시지 문자열로 변환
            console.log('errorMsg', errorMsg);
            setErrMsg(errorMsg); // 문자열로 상태 업데이트
        }
    };
    
    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    // const handleDelete = async () => {
    //     try {
    //         // 선택된 거래 내역의 정보 조회
    //         const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
    //         const transactionData = response.data;
    //         const transactionDate = new Date(transactionData.transaction_date); // 거래된 날짜
    //         const transactionAmount = parseFloat(transactionData.transaction_amount);
    
    //         // 해당 거래 내역의 카드 정보 조회
    //         const cardResponse = await axios.get(`${API_URLS.CARDS}/${transactionData.card_id}`);
    //         const cardData = cardResponse.data;
    //         let updatedBalance = parseFloat(cardData.balance);
    //         let rolloverAmount = parseFloat(cardData.rollover_amount);
    
    //         // 해당 거래 이후의 거래 내역이 있는지 확인
    //         const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${transactionData.card_id}`);
    //         const transactions = transactionsResponse.data;
    
    //         // 거래 이후에 발생한 거래가 있는지 확인
    //         const hasPostTransactionTransactions = transactions.some(transaction => {
    //             const txnDate = new Date(transaction.transaction_date);
    //             return txnDate > transactionDate && transaction.transaction_type === 'expense';
    //         });
    
    //         if (hasPostTransactionTransactions) {
    //             // 거래 이후에 발생한 거래가 있으면 삭제 방지
    //             setErrMsg("이 거래 이후에 사용된 내역이 있어 삭제할 수 없습니다.");
    //             console.warn('거래 이후 사용 내역이 있어 삭제가 불가능합니다.');
    //             return;
    //         }
    
    //         // 거래 내역의 금액을 차감하여 balance 업데이트
    //         if (transactionData.deposit_type === 'TeamFund') {
    //             // 팀 운영비인 경우
    //             updatedBalance = Math.max(updatedBalance, 0); // 카드 잔액은 음수가 될 수 없음
    //         } else {
    //             // 일반 지출의 경우
    //             if (updatedBalance + rolloverAmount < transactionAmount) {
    //                 const remainingAmountToDeduct = transactionAmount - (updatedBalance + rolloverAmount);
    //                 updatedBalance = Math.max(updatedBalance - remainingAmountToDeduct, 0);
    //                 rolloverAmount = Math.max(rolloverAmount - remainingAmountToDeduct, 0);
    //             } else {
    //                 // 일반 카드에서 지출할 경우
    //                 updatedBalance += transactionAmount; // 삭제로 인해 잔액 복구
    //             }
    //         }
    
    //         // 거래 내역 삭제
    //         await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
    //         console.log('거래 내역 삭제 완료');
    
    //         // 거래 내역 갱신
    //         fetchTransactionsForCurrentMonth();
    //         fetchCards();
    
    //         // 삭제 확인 모달 닫기
    //         setIsDeleteConfirmOpen(false);
    //         handleCloseDrawer();
    //     } catch (error) {
    //         setErrMsg("삭제 중 오류가 발생했습니다.");
    //         console.error('삭제 중 오류:', error);
    //     }
    // };

    const handleDelete = async () => {
        try {
            // 서버에 트랜잭션 삭제 요청
            await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
            console.log('거래 내역 삭제 완료');
    
            // 거래 내역 갱신
            fetchTransactionsForCurrentMonth();
            fetchCards();
    
            // 삭제 확인 모달 닫기
            setIsDeleteConfirmOpen(false);
            handleCloseDrawer();
        } catch (error) {
            setErrMsg("삭제 중 오류가 발생했습니다.");
            console.error('삭제 중 오류:', error);
        }
    };

    const groupedTransactions = transactions.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
        if (!acc[transactionDate]) {
            acc[transactionDate] = [];
        }
        acc[transactionDate].push(transaction);
        return acc;
    }, {});

    const userCardsWithTotals = userCards.map(card => {
        const totalSpent = transactions
            .filter(tx => tx.card_id._id === card._id && tx.transaction_type === 'expense')
            .reduce((sum, tx) => sum + Number(tx.transaction_amount), 0);
    
        return {
            ...card,
            totalSpent
        };
    });

    return (
        <>
            <header className={`flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>내 카드</span>
                </div>
            </header>
            <div className='flex-1 w-full p-4 sm:p-6'>
                {/* 카드 한도와 남은 금액 표시 */}
                <div className='mb-8'>
                    {userCardsWithTotals.map(card => {
                        const currentBalanceWithRollover = card.balance + (card.rollover_amount || 0) + (card.team_fund || 0); // 이월 금액 포함한 잔액 계산
                        return (
                            <Card
                                key={card._id} 
                                cardNumber={card.card_number}
                                totalSpent={Number(card.totalSpent)}
                                currentBalance={currentBalanceWithRollover} // 이월 금액을 포함한 잔액 전달
                                rolloverAmount={Number(card.rollover_amount)}
                            />
                        );
                    })}
                </div>

                {/* 트랜잭션 목록 */}

                <div className='flow-root'>
                    
                    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-slate-800 dark:border dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-xl font-semibold leading-none text-black dark:text-white">카드 사용 내역</h5>
                            <button
                                type="button" 
                                className='text-black font-semibold rounded-lg text-2xl dark:text-white'
                                onClick={handleAddTransaction}
                            ><IoAddCircleOutline /></button>
                        </div>
                    {Object.keys(groupedTransactions).length === 0 ? (
                        <div className="flex justify-center items-center text-gray-500 dark:text-gray-400">
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

                {/* 삭제 모달 : 추후 컴포넌트로 변경 */}
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 z-110 flex items-center justify-center bg-gray-900 bg-opacity-50">
                        <div className="bg-white rounded-lg p-6 w-11/12 md:w-96">
                            <h3 className="text-lg font-semibold mb-4">정말로 삭제하시겠습니까?</h3>
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                                    onClick={handleDeleteCancel}
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                                    onClick={handleDelete}
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <CommonDrawer
                    isOpen={isOpen}
                    onClose={handleCloseDrawer}
                    title={isEditing ? "거래 내역 수정" : "거래 내역 추가"}
                    errMsg={errMsg}
                    onSave={handleSave}
                    >

                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6 dark:bg-slate-800">
                        {errMsg && <div className="text-red-600 dark:text-red-300">{errMsg}</div>} {/* 에러 메시지 표시 */}

                        { user.position === '팀장' && (
                            <div>
                                <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-white">지출 카드</h3>
                                <ul className="grid w-full gap-2 grid-cols-2">
                                        <li>
                                            <input
                                                type="radio"
                                                id="expense_type_a"
                                                name="expenseType"
                                                value="TeamCard" // 기본 팀카드 사용
                                                className="hidden peer"
                                                checked={expenceType === 'TeamCard'}
                                                ref={expenceTypeRef}
                                                onChange={() => { setExpenceType('TeamCard'); }}
                                                required
                                            />
                                            <label
                                                htmlFor="expense_type_a"
                                                className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                                <div className="block">
                                                    <div className="w-full text-md font-semibold">팀 카드</div>
                                                    <div className="w-full text-sm">잔액: {cardBalance.toLocaleString()}원</div>
                                                </div>
                                                {expenceType === 'TeamCard' && <IoCheckmark className="w-6 h-6" />}
                                            </label>
                                        </li>

                                    <li>
                                        <input
                                            type="radio"
                                            id="expense_type_b"
                                            name="expenseType"
                                            value="TeamFund" // team_fund 사용 구분
                                            className="hidden peer"
                                            checked={expenceType === 'TeamFund'}
                                            onChange={() => setExpenceType('TeamFund')} // 상태 업데이트
                                        />
                                        <label
                                            htmlFor="expense_type_b"
                                            className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                        >
                                            <div className="block">
                                                <div className="w-full text-md font-semibold">팀 운영비</div>
                                                <div className="w-full text-sm">잔액: {teamFund.toLocaleString()}원</div>
                                            </div>
                                            {expenceType === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        )}
                        <InputField 
                            label="상호명" 
                            id="merchant_name" 
                            value={selectedTransaction?.merchant_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, merchant_name: e.target.value })}
                            placeholder="상호명 입력"
                            ref={expenceMerchantRef}
                            disabled={!expenceType}
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
                            disabled={!expenceType}
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
                            disabled={!expenceType}
                            required={true}
                        />
                        <InputField 
                            label="메뉴명" 
                            id="menu_name" 
                            value={selectedTransaction?.menu_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedTransaction({ ...selectedTransaction, menu_name: e.target.value })}
                            placeholder="메뉴명(옵션) 입력"
                            disabled={!expenceType}
                        />
                        <SelectField
                            label="사용 카드"
                            id="card_id"
                            value={getCardId() || ""}
                            onChange={handleCardChange}
                            options={userCards.map(card => ({ value: card._id, label: card.card_number }))}
                            placeholder="카드 선택"
                            disabled={!expenceType}
                            required={true}
                        />


                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6 dark:bg-slate-800">
                        <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                            {isEditing ? '수정' : '등록'}
                        </button>
                        {!isEditing ? <button
                                type="button" 
                                className='text-gray-600 font-semibold dark:text-gray-400 dark:font-normal'
                                onClick={handleCloseDrawer}
                            >닫기</button> : <button
                                type="button" 
                                className='text-red-600 font-semibold dark:text-orange-400 dark:font-normal'
                                onClick={handleDeleteConfirm}
                            >삭제 할래요</button>
                        }
                    </div>
                </CommonDrawer>
            </div>
        </>
    );
}

export default Transactions;
