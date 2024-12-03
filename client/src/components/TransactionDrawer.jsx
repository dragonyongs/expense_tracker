import React, { useState, useEffect } from 'react';
import CommonDrawer from '../components/CommonDrawer'; // 공통 드로우 컴포넌트
import InputField from '../components/InputField'; // 커스텀 입력 필드
import SelectField from '../components/SelectField'; // 커스텀 셀렉트 필드
import axios from "../services/axiosInstance"; 
import PropTypes from 'prop-types';
import { API_URLS } from '../services/apiUrls';

const TransactionDrawer = ({
    isOpen,
    onClose,
    onSave,
    transactionData = {},
    userCards,
    isEditing,
    onDelete,
    user,
    cardBalance,
    teamFund,
}) => {

    const [errMsg, setErrMsg] = useState('');
    const [expenseType, setExpenseType] = useState("RegularExpense"); // 기본 값
    const [selectedTransaction, setSelectedTransaction] = useState({
        card_id: userCards.length > 0 ? userCards[0]._id : "",
        transaction_date: new Date().toISOString().split('T')[0],
        merchant_name: "",
        transaction_amount: "",
        menu_name: "",
    });

    useEffect(() => {
        if (isOpen) {
            setSelectedTransaction({
                card_id: userCards.length > 0 ? userCards[0]._id : "",
                transaction_date: new Date().toISOString().split('T')[0], // 기본값 설정
                merchant_name: "",
                transaction_amount: "",
                menu_name: "",
            });
        }
    }, [isOpen, userCards]);

    useEffect(() => {
        if (transactionData) {
            setSelectedTransaction(prev => ({
                ...prev,
                ...transactionData,
                card_id: transactionData.card_id || (userCards.length > 0 ? userCards[0]._id : ""),
                transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0], // 기본값 설정
            }));
        } else {
            setSelectedTransaction({
                card_id: userCards.length > 0 ? userCards[0]._id : "",
                transaction_date: new Date().toISOString().split('T')[0], // 기본값 설정
            });
        }
    }, [transactionData, userCards]);

    const handleExpenseTypeChange = (type) => {
        setExpenseType(type);
        setSelectedTransaction(prev => ({
            ...prev,
            expense_type: type,
        }));
    };

    const handleCardChange = (e) => {
        setSelectedTransaction(prev => ({
            ...prev,
            card_id: e.target.value,
        }));
    };

    const handleSave = async () => {
        try {
            setErrMsg('');

            const cardId = selectedTransaction.card_id || userCards[0]._id;
            const transactionData = {
                card_id: cardId,
                transaction_date: selectedTransaction.transaction_date,
                merchant_name: selectedTransaction.merchant_name,
                menu_name: selectedTransaction.menu_name,
                transaction_type: "expense",
                expense_type: expenseType,
            };

            // 금액이 변경된 경우에만 transaction_amount 추가
            const originalAmount = Number(transactionData.transaction_amount); // 예시로
            const currentAmount = Number(selectedTransaction.transaction_amount);

            if (originalAmount !== currentAmount) {
                transactionData.transaction_amount = currentAmount;
            }

            if (isEditing) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedTransaction._id}`, transactionData);
            } else {
                const response = await axios.post(API_URLS.TRANSACTIONS, transactionData);
                onSave(response.data.transaction); 
                onClose();
            }
        } catch (error) {
            const errorMsg = handleError(error);
            console.log('errorMsg', errorMsg);
            setErrMsg(errorMsg);
        }
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

    return (
        <CommonDrawer
            color="#FFFFFF"
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? "거래 내역 수정" : "거래 내역 추가"}
            errMsg={errMsg}
            onSave={handleSave}
        >
            <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6 dark:bg-slate-800">
                {errMsg && <div className="text-red-600 dark:text-red-300">{errMsg}</div>}

                {user.position === '팀장' && (
                    <div>
                        <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-white">지출 타입</h3>
                        <ul className="grid w-full gap-2 grid-cols-2">
                            <li>
                                <input
                                    type="radio"
                                    id="expense_type_a"
                                    name="expenseType"
                                    value="RegularExpense"
                                    className="hidden peer"
                                    checked={expenseType === 'RegularExpense'}
                                    onChange={() => handleExpenseTypeChange('RegularExpense')}
                                    required
                                />
                                <label
                                    htmlFor="expense_type_a"
                                    className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <div className="block">
                                        <div className="w-full text-md font-semibold">일반 지출</div>
                                        <div className="w-full text-sm">잔액: {cardBalance.toLocaleString()}원</div>
                                    </div>
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
                                    onChange={() => handleExpenseTypeChange('TeamFund')}
                                />
                                <label
                                    htmlFor="expense_type_b"
                                    className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <div className="block">
                                        <div className="w-full text-md font-semibold">팀 운영비</div>
                                        <div className="w-full text-sm">잔액: {teamFund.toLocaleString()}원</div>
                                    </div>
                                </label>
                            </li>
                        </ul>
                    </div>
                )}

                <InputField
                    label="상호명"
                    id="merchant_name"
                    value={selectedTransaction.merchant_name || ""}
                    className="bg-white border border-slate-200"
                    onChange={(e) =>
                        setSelectedTransaction(prev => ({
                            ...prev,
                            merchant_name: e.target.value,
                        }))
                    }
                    placeholder="상호명 입력"
                    required={true}
                />
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

                <InputField
                    label="메뉴명"
                    id="menu_name"
                    value={selectedTransaction.menu_name || ""}
                    className="bg-white border border-slate-200"
                    onChange={(e) =>
                        setSelectedTransaction(prev => ({
                            ...prev,
                            menu_name: e.target.value,
                        }))
                    }
                    placeholder="메뉴명 입력"
                />
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
            </div>

            <div className="flex flex-col gap-3 pt-4 p-6 dark:bg-slate-800">
                <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                    {isEditing ? '수정' : '등록'}
                </button>
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className='text-gray-600 font-semibold dark:text-gray-400 dark:font-normal'
                    >
                        닫기
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onDelete}
                        className='text-red-600 font-semibold dark:text-orange-400 dark:font-normal'
                    >
                        삭제
                    </button>
                )}
            </div>
        </CommonDrawer>
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
    user: PropTypes.object.isRequired,
    cardBalance: PropTypes.number.isRequired,
    teamFund: PropTypes.number.isRequired,
};

export default TransactionDrawer;