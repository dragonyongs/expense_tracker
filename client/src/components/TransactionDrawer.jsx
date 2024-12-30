import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import Drawer from 'react-modern-drawer';
import useMediaQuery from '../hooks/useMediaQuery';
import InputField from '../components/InputField'; 
import SelectField from '../components/SelectField';
import PropTypes from 'prop-types';
import { IoCheckmark } from "react-icons/io5";
import { MdClose } from 'react-icons/md';
import { API_URLS } from '../services/apiUrls';
// import { useDarkMode } from '../context/DarkModeContext';
// import { useLocation } from 'react-router-dom';
// import { useTheme } from '../context/ThemeColorContext';
import useDrawerTheme from '../hooks/useDrawerTheme';

const TransactionDrawer = ({
    isOpen,
    onClose,
    onSave,
    transactionData,
    userCards,
    isEditing,
    onDelete,
    cardBalance,
    teamFund,
    errMsg,
}) => {
    
    const [errorMessage, setErrorMessage] = useState('');
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
    
    const [expenseType, setExpenseType] = useState('RegularExpense');
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [merchantSuggestions, setMerchantSuggestions] = useState([]);
    const [menuSuggestions, setMenuSuggestions] = useState([]);
    
    // const { isDarkMode } = useDarkMode();
    // const { setThemeColor, resetThemeColor } = useTheme();
    // const location = useLocation();

    // useEffect(() => {
    //     if (isOpen) {
    //         const newColor = getDrawerColor(location.pathname);
    //         setThemeColor(newColor);
    //     } else {
    //         resetThemeColor();
    //     }
    // }, [isOpen, location.pathname, setThemeColor, resetThemeColor]);

    // const getDrawerColor = (pathname) => {
    //     console.log(pathname);
    //     if (pathname === '/') {
    //         return '#0433FF';
    //     } else if (pathname === '/contacts') {
    //         return '#0433FF';
    //     } else if (pathname === '/contact') {
    //         return '#dce8f5';
    //     } else if (pathname === '/profile') {
    //         return '#59626e';
    //     } else {
    //         return '#FFFFFF';
    //     }
    // };
    useDrawerTheme(isOpen);

    useEffect(() => {
        if (isOpen) {
            const isExistingTransaction = Boolean(transactionData && transactionData.expense_type);
    
            if (isExistingTransaction) {
                setSelectedTransaction({
                    ...transactionData,
                    card_id: transactionData.card_id || (userCards.length > 0 ? userCards[0]._id : ""),
                });
                setExpenseType(transactionData.expense_type);
            } else {
                if (cardBalance <= 0) {
                    setExpenseType("TeamFund");
                    setSelectedTransaction({
                        ...selectedTransaction, 
                        card_id: userCards.length > 0 ? userCards[0]._id : "",
                        expense_type: 'TeamFund'
                    });
                } else {
                    setExpenseType("RegularExpense");
                }
            }
    
            setMerchantSuggestions([]);
            setMenuSuggestions([]);
        }
    }, [isOpen, transactionData, userCards, cardBalance]);

    const getCardExpenseType = (card) => {
        const isOvertimeMealCard = card.card_type === 'OvertimeMealCard';
        return {
            expense_card: isOvertimeMealCard ? 'OvertimeMealCard' : 'TeamCard',
            expense_type: isOvertimeMealCard ? 'OvertimeMealExpense' : 'RegularExpense',
        };
    };

    const getCardBalances = (card) => ({
        balance: card.balance || 0,
        team_fund: card.team_fund || 0,
    });

    const handleExpenseTypeChange = (type) => {
        const expenseCardMapping = {
            'TeamFund': 'TeamFund',
            'OvertimeMealExpense': 'OvertimeMealCard',
        };
    
        const selectedCard = expenseCardMapping[type] || 'TeamCard';
    
        setExpenseType(type);
        setSelectedTransaction(prev => ({
            ...prev,
            expense_card: selectedCard,
            expense_type: type,
        }));
    };
    

    const handleCardChange = (e) => {
        const cardId = e.target.value;
        const activeCard = userCards.find(card => card._id === cardId);
    
        const { expense_card, expense_type } = getCardExpenseType(activeCard);
        const { balance, team_fund } = getCardBalances(activeCard);
    
        setSelectedTransaction({
            ...selectedTransaction,
            card_id: cardId,
            expense_card,
            expense_type,
            balance,
            team_fund
        });
    };

    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    const handleDeleteClick = () => {
        const transactionId = transactionData?._id;
        if (transactionId) {
            onDelete(transactionId);
        }
        setIsDeleteConfirmOpen(false);
    };

    const fetchMenuForMerchant = async (merchantName) => {
        try {
            const response = await axios.get(`${API_URLS.SEARCH_MENU_FOR_MERCHANT}/${merchantName}`);
            setMenuSuggestions(response.data);
        } catch (error) {
            console.error("메뉴 조회 오류:", error);
            setMenuSuggestions([]);
        }
    };

    const handleSaveClick = () => {
        if (cardBalance === 0 && teamFund === 0) {
            setErrorMessage("잔액을 모두 사용해 기록할 수 없습니다.");
            return;
        } else if (!selectedTransaction.card_id || !selectedTransaction.transaction_amount || !selectedTransaction.transaction_date || !selectedTransaction.merchant_name || !selectedTransaction.merchant_name) {
            setErrorMessage("필수 필드를 모두 입력해주세요.");
            return;
        }
        setInitialColor(originalColor);
        onSave(selectedTransaction);
    };

    const handleMerchantInputChange = async (e) => {
        const value = e.target.value;
        setSelectedTransaction(prev => ({
            ...prev,
            merchant_name: value,
        }));

        if (value.length > 1) { // 최소 3자 이상 입력 시 검색
            try {
                const response = await axios.get(`${API_URLS.SEARCH_KEYWORD}/${value}`);
                setMerchantSuggestions(response.data);
            } catch (error) {
                console.error("검색 오류:", error);
                setMerchantSuggestions([]); // 에러 발생 시 제안 목록 초기화
            }
        } else {
            setMerchantSuggestions([]);
        }
    };
    
    const handleMerchantSuggestionClick = (merchant_name) => {
        setSelectedTransaction(prev => ({
            ...prev,
            merchant_name,
        }));
        setMerchantSuggestions([]);
        fetchMenuForMerchant(merchant_name); // 선택한 상호명에 대한 메뉴 조회
    };
    
    const handleMenuInputChange = async (e) => {
        const value = e.target.value;
        setSelectedTransaction(prev => ({
            ...prev,
            menu_name: value,
        }));
    
        // 메뉴명 검색 로직
        if (value.length > 2 && selectedTransaction.merchant_name) {
            try {
                // 선택된 상호명에 대한 메뉴 목록을 필터링
                const filteredMenus = menuSuggestions.filter(menu => 
                    menu.menu_name.toLowerCase().includes(value.toLowerCase())
                );
                setMenuSuggestions(filteredMenus);
            } catch (error) {
                console.error("검색 오류:", error);
                setMenuSuggestions([]);
            }
        } else {
            setMenuSuggestions([]);
        }
    };
    
    const handleMenuSuggestionClick = (menu) => {
        setSelectedTransaction(prev => ({
            ...prev,
            menu_name: menu.menu_name,
            transaction_amount: menu.transaction_amount,
        }));
        setMenuSuggestions([]);
    };

    const isMobile = useMediaQuery("(max-width: 640px)");
    const drawerSize = isMobile ? "100%" : "375px";
    
    return (
        <>
            <Drawer open={isOpen} onClose={onClose} className="h-real-screen" duration="300" direction="right" size={drawerSize}>
                <div
                    className="flex justify-between py-2 px-4 dark:bg-slate-800"
                >
                    <h5 className="text-lg font-bold dark:text-slate-200">{isEditing ? "카드 지출 수정" : "카드 지출 추가"}</h5>
                    <button onClick={onClose}>
                        <MdClose className="text-2xl dark:text-slate-300" />
                    </button>
                </div>
                <div className="dark:bg-slate-800">
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6 dark:bg-slate-800">
                        {errMsg || errorMessage && <div className="text-red-600 dark:text-red-300">{errMsg || errorMessage }</div>}

                        <div>
                            <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-white">지출 타입</h3>
                            { selectedTransaction.expense_card === 'OvertimeMealCard' ? ( 
                                <ul className="grid w-full gap-2 grid-cols-1">
                                        <li>
                                            <input
                                                type="radio"
                                                id="expense_type_d"
                                                name="expenseType"
                                                value="OvertimeMealExpense"
                                                className="hidden peer"
                                                checked={expenseType === 'OvertimeMealExpense'}
                                                onChange={() => handleExpenseTypeChange('OvertimeMealExpense')}
                                                disabled={isEditing && transactionData.expense_type !== 'OvertimeMealExpense'}
                                                required
                                            />
                                            <label
                                                htmlFor="expense_type_d"
                                                className="peer-disabled:bg-gray-50 peer-disabled:text-gray-300 iinline-flex items-center justify-between w-1/2 p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                            >
                                                <div className="block">
                                                    <div className="w-full text-md font-semibold">야근 식대</div>
                                                    <div className="w-full text-sm">잔액: {selectedTransaction.balance.toLocaleString()}원</div>
                                                </div>
                                                {expenseType === 'OvertimeMealExpense' && <IoCheckmark className="w-6 h-6" />}
                                            </label>
                                        </li>
                                    </ul>
                            ) : ( 
                                <ul className="grid w-full gap-2 grid-cols-2">
                                    <li>
                                        <input
                                            type="radio"
                                            id="expense_type_a"
                                            name="expenseType"
                                            value="RegularExpense"
                                            className="hidden peer"
                                            checked={expenseType === 'RegularExpense'}
                                            disabled={isEditing && transactionData.expense_type !== 'RegularExpense' || !isEditing && cardBalance === 0}
                                            onChange={() => handleExpenseTypeChange('RegularExpense')}
                                            required
                                        />
                                        <label
                                            htmlFor="expense_type_a"
                                            className="peer-disabled:bg-gray-50 peer-disabled:dark:bg-slate-900 peer-disabled:dark:text-slate-500 peer-disabled:text-gray-300 inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:dark:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                        >
                                            <div className="block">
                                                <div className="w-full text-md font-semibold">일반 지출</div>
                                                {!isEditing && <div className="w-full text-sm">잔액: {cardBalance.toLocaleString()}원</div>}
                                            </div>
                                            {expenseType === 'RegularExpense' && <IoCheckmark className="w-6 h-6" />}
                                        </label>
                                    </li>
                                    <li>
                                        <input
                                            type="radio"
                                            id="expense_type_b"
                                            name="expenseType"
                                            value="TeamFund"
                                            className="hidden peer"
                                            checked={expenseType === 'TeamFund'}
                                            disabled={isEditing && transactionData.expense_type !== 'TeamFund' || !isEditing && teamFund === 0}
                                            onChange={() => handleExpenseTypeChange('TeamFund')}
                                        />
                                        <label
                                            htmlFor="expense_type_b"
                                            className="peer-disabled:border-gray-300 peer-disabled:bg-gray-50 peer-disabled:text-gray-300 inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                        >
                                            <div className="block">
                                                <div className="w-full text-md font-semibold">팀 운영비</div>
                                                {!isEditing && <div className="w-full text-sm">잔액: {teamFund.toLocaleString()}원</div> }
                                            </div>
                                            {expenseType === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                        </label>
                                    </li>
                                </ul>
                                ) }
                        </div>

                        <div className='relative'>
                            <InputField
                                label="상호명"
                                id="merchant_name"
                                value={selectedTransaction.merchant_name || ""}
                                className="bg-white border border-slate-200"
                                onChange={handleMerchantInputChange}
                                placeholder="상호명 입력"
                                required={true}
                            />
                            {merchantSuggestions.length > 0 && (
                                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                    {merchantSuggestions.map((merchantName, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleMerchantSuggestionClick(merchantName)}
                                            className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                                        >
                                            {merchantName}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* {merchantSuggestions.length > 0 && (
                                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                    {merchantSuggestions.map((suggestion) => (
                                        <li
                                            key={suggestion._id}
                                            onClick={() => handleMerchantSuggestionClick(suggestion)}
                                            className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                                        >
                                            {suggestion.merchant_name}
                                        </li>
                                    ))}
                                </ul>
                            )} */}

                        </div>
                        <div className='relative'>
                            <InputField
                                label="메뉴명"
                                id="menu_name"
                                value={selectedTransaction.menu_name || ""}
                                className="bg-white border border-slate-200"
                                onChange={handleMenuInputChange}
                                placeholder="메뉴명 입력"
                            />
                            {menuSuggestions.length > 0 && (
                                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                    {menuSuggestions.map((suggestion) => (
                                        <li
                                            key={suggestion.menu_name}
                                            onClick={() => handleMenuSuggestionClick(suggestion)}
                                            className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                                        >
                                            {suggestion.menu_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* {menuSuggestions.length > 0 && (
                                <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                                    {menuSuggestions.map((menuName, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleMenuSuggestionClick(menuName)}
                                            className="cursor-pointer py-2 px-4 hover:bg-blue-100 active:bg-blue-200 transition-colors duration-200"
                                        >
                                            {menuName}
                                        </li>
                                    ))}
                                </ul>
                            )} */}

                        </div>
                        <InputField
                            label="지출금액"
                            id="transaction_amount"
                            type="number"
                            value={selectedTransaction.transaction_amount || ""}
                            className="bg-white border border-slate-200"
                            onChange={(e) =>
                                setSelectedTransaction(prev => ({
                                    ...prev,
                                    transaction_amount: e.target.value,
                                }))
                            }
                            placeholder="지출금액 입력"
                            required={true}
                        />
                        <InputField
                            label="거래일"
                            id="transaction_date"
                            type="date"
                            value={selectedTransaction.transaction_date || ''}  // 값이 없으면 기본값 설정
                            className="bg-white border border-slate-200"
                            onChange={(e) => {
                                console.log("Transaction date changed:", e.target.value);  // 값 변경 로그 확인
                                setSelectedTransaction(prev => ({
                                    ...prev,
                                    transaction_date: e.target.value,
                                }));
                            }}
                            required={true}
                        />

                        {userCards.length >= 2 && (
                            <SelectField
                                label="사용 카드"
                                id="card_id"
                                value={selectedTransaction.card_id}
                                onChange={handleCardChange}
                                options={userCards.map(card => ({
                                    value: card._id,
                                    label: card.card_number,
                                }))}
                                required={true}
                            />
                        )}
                        
                    </div>

                    <div className="flex flex-col gap-y-2 px-6 dark:bg-slate-800">
                        <button type="button" onClick={handleSaveClick} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                            {isEditing ? '수정' : '추가'}
                        </button>
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className='py-3 rounded-lg text-gray-600 font-semibold dark:text-gray-400 dark:font-normal'
                            >
                                닫기
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className='py-3 rounded-lg text-red-600 font-semibold dark:text-orange-400 dark:font-normal'
                            >
                                삭제
                            </button>
                        )}
                    </div>
                    </div>
                </Drawer>

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
                                onClick={handleDeleteClick}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

TransactionDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    transactionData: PropTypes.object.isRequired,
    userCards: PropTypes.array.isRequired,
    isEditing: PropTypes.bool.isRequired,
    onDelete: PropTypes.func.isRequired,
    errMsg: PropTypes.string,
    setErrMsg: PropTypes.string,
    cardBalance: PropTypes.number.isRequired,
    teamFund: PropTypes.number.isRequired,
    drawerColor: PropTypes.string,
};

export default TransactionDrawer;

// const handleSave = async () => {
    //     try {
    //         setErrMsg('');

    //         const cardId = selectedTransaction.card_id || userCards[0]._id;
    //         const transactionData = {
    //             card_id: cardId,
    //             transaction_date: selectedTransaction.transaction_date,
    //             merchant_name: selectedTransaction.merchant_name,
    //             menu_name: selectedTransaction.menu_name,
    //             transaction_type: "expense",
    //             expense_card: selectedTransaction.expense_card,
    //             expense_type: expenseType,
    //             transaction_amount: selectedTransaction.transaction_amount,
    //         };

    //         // 금액이 변경된 경우에만 transaction_amount 추가
    //         const originalAmount = Number(transactionData.transaction_amount); // 예시로
    //         const currentAmount = Number(selectedTransaction.transaction_amount);

    //         if (originalAmount !== currentAmount) {
    //             transactionData.transaction_amount = currentAmount;
    //         }

    //         if (isEditing) {
    //             await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
    //         } else {
    //             const response = await axios.post(API_URLS.TRANSACTIONS, transactionData);
    //             onSave(response.data.transaction); 
    //             onClose();
    //         }
    //     } catch (error) {
    //         const errorMsg = handleError(error);
    //         console.log('errorMsg', errorMsg);
    //         c
    //     }
    // };

    // const handleDelete = async () => {
    //     try {
    //         await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`);
    //         onDelete();
    //         onClose();
    //     } catch (error) {
    //         setErrMsg("삭제 중 오류가 발생했습니다.");
    //         console.error('삭제 중 오류:', error);
    //     }
    // };

        // useEffect(() => {
    //     if (transactionData.length > 0) {
    //         console.log("transactionData", transactionData);
    //         setSelectedTransaction(prev => ({
    //             ...prev,
    //             ...transactionData,
    //             card_id: transactionData.card_id || (userCards.length > 0 ? userCards[0]._id : ""),
    //             transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0], // 기본값 설정
    //         }));
    //         setExpenseType(transactionData.expense_type);
    //         console.log("transactionData.expense_type", transactionData.expense_type);
    //     }
    // }, [transactionData, userCards]);
