import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import calculateUniqueTeamMembersCount from '../utils/teamUtils';
import { calculateTeamDepositAmount } from '../utils/depositUtils';

import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import { TbCircleMinus } from "react-icons/tb";

import AdminHeader from '../components/AdminHeader';

const AdminDeposit = () => {
    const [state, setState] = useState({
        users: [],
        cards: [],
        accounts: [],
        deposits: [],
        selectedCardId: '',
        selectedUserId: '',
        selectedUser: {},
        selectedDeposit: {
            _id: "",
            member_name: "",
            card_id: "",
            merchant_name: "",
            menu_items: [],
            transaction_date: "",
            transaction_amount: "", 
            transaction_type: "",
            deposit_type: "RegularDeposit",
            is_deducted: false,
        },
        selectUserPosition: '',
        loading: true,
        isDeleteConfirmOpen: false,
        isEditing: false,
        isOpen: false,
        isDeductedOpen: false,
        errMsg: '',
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const fetchData = async (url, key) => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            const response = await axios.get(url, { withCredentials: true });
            let data = response.data;

            if (key === 'deposits') {
                data = data.sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA || new Date(b.transaction_date) - new Date(a.transaction_date);
                });
            }
            setState(prev => ({ ...prev, [key]: data, loading: false }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: `데이터 로드 중 오류: ${error.message}`, loading: false }));
        }
    };

    const fetchFilteredMembers = async () => {
        try {
            const [cardsResponse, membersResponse, depositsResponse] = await Promise.all([
                axios.get(API_URLS.CARDS),
                axios.get(API_URLS.FILTERED_MEMBERS),
                axios.get(API_URLS.DEPOSITS),
            ]);

            const validCards = cardsResponse.data.filter(card => card.member_id && card.card_number);
            const validMemberIds = validCards.map(card => card.member_id._id);
            const depositsThisMonth = depositsResponse.data.filter(deposit => {
                const depositDate = new Date(deposit.createdAt);
                return (
                    depositDate.getMonth() + 1 === currentMonth &&
                    depositDate.getFullYear() === currentYear
                );
            });

            const depositStatusMap = membersResponse.data.reduce((acc, member) => {
                acc[member._id] = {
                    hasRegularDeposit: depositsThisMonth.some(deposit => deposit.deposit_type === 'RegularDeposit' && deposit.card_id.member_id === member._id),
                    hasTeamFund: depositsThisMonth.some(deposit => deposit.deposit_type === 'TeamFund' && deposit.card_id.member_id === member._id),
                };
                return acc;
            }, {});

            const updatedMembers = membersResponse.data
                .filter(member => validMemberIds.includes(member._id))
                .map(member => ({
                    ...member,
                    ...depositStatusMap[member._id],
                    showRadioButton: !depositStatusMap[member._id].hasRegularDeposit,
                }));
            setState(prev => ({ ...prev, users: updatedMembers }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: "사용자 목록을 불러오지 못했습니다." }));
        }
    };

    useEffect(() => {
        const fetchDeposits = async () => {
            await fetchData(`${API_URLS.DEPOSITS}/${currentYear}/${currentMonth}`, 'deposits');
        };
        fetchDeposits();
    }, [currentYear, currentMonth]);

    useEffect(() => {
        if (state.isOpen) fetchFilteredMembers();
    }, [state.isOpen]);

    useEffect(() => {
        if (state.selectedUserId) {
            const fetchUserAndAccounts = async () => {
                await fetchData(`${API_URLS.MEMBERS}/${state.selectedUserId}`, 'selectedUser');
                await fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}/${state.selectedUserId}`, 'accounts');
            };
            fetchUserAndAccounts();
        }
    }, [state.selectedUserId]);

    const handleDeleteConfirm = () => {
        setState(prev => ({ ...prev, isDeleteConfirmOpen: true }));
    };

    const handleDeleteCancel = () => {
        setState(prev => ({ ...prev, isDeleteConfirmOpen: false }));
    };

    const handleOpenDrawer = async (deposit) => {
        try {
            const memberId = deposit?.card_id?.member_id || null;
            const cardId = deposit?.card_id?._id || null;           
            const response = await axios.get(`${API_URLS.CARDS}/member/${memberId}`);
            const userCards = response.data;
            const userPosition = userCards.find(card => card.member_id._id === memberId);

            setState(prev => ({
                ...prev,
                selectUserPosition: userPosition.member_id.position,
                cards: userCards,
                selectedDeposit: deposit,
                selectedCardId: cardId,
                selectedUserId: memberId,
                isEditing: true,
                isOpen: true,
            }));

        } catch (error) {
            setState(prev => ({ ...prev, errMsg: "카드 정보를 가져오는 데 실패했습니다." }));
        }
    };

    const handleCloseDrawer = () => {
        setState(prev => ({
            ...prev,
            errMsg: '',
            selectedDeposit: {
                _id: "",
                member_name: "",
                card_id: "",
                merchant_name: "",
                menu_items: [],
                transaction_date: "",
                transaction_amount: "", 
                transaction_type: "",
                deposit_type: "RegularDeposit",
                is_deducted: false,
            },
            isOpen: false,
            isDeductedOpen: false,
        }));
    };

    const handleUserChange = async (e) => {
        const changeUserId = e.target.value;
        try {
            const response = await axios.get(`${API_URLS.CARDS}/member/${changeUserId}`);
            const userCards = response.data;
            const userPosition = userCards[0]?.member_id?.position || "";
            setState(prev => ({
                ...prev,
                selectedUserId: changeUserId,
                selectUserPosition: userPosition,
                cards: userCards,
                selectedCardId: userCards.length > 0 ? userCards[0]._id : '',
                selectedDeposit: {
                    ...prev.selectedDeposit,
                    position: userPosition,
                    member_id: changeUserId,
                    card_id: userCards.length > 0 ? userCards[0]._id : '',
                },
            }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: "카드 목록을 불러오지 못했습니다." }));
        }
    };

    const handleCardChange = (e) => {
        const cardId = e.target.value;
        const card = state.cards.find(card => card._id === cardId);
        if (card) {
            setState(prev => ({
                ...prev,
                selectedCardId: cardId,
            }));
        }
    };

    const handleSave = async () => {
        try {
            setState(prev => ({ ...prev, errMsg: "" }));
            const { selectedUserId, selectedCardId, selectedDeposit, accounts, cards, isDeductedOpen, isEditing } = state;

            if (!selectedUserId || !selectedCardId || !selectedDeposit.deposit_type || !selectedDeposit.transaction_amount) {
                setState(prev => ({ ...prev, errMsg: "모든 필드를 채워주세요." }));
                return;
            }

            const transactionAmount = selectedDeposit.transaction_amount;
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${selectedCardId}`);
            const cardData = cardResponse.data;

            const transactionType = isDeductedOpen ? "expense" : "income";
            let depositAmount = parseFloat(transactionAmount);

            if (!isDeductedOpen) {
                if (!isEditing && selectedDeposit.deposit_type === "RegularDeposit") {
                    const teamMembersCount = calculateUniqueTeamMembersCount(state.accounts);
                    const updatedCards = calculateTeamDepositAmount([cardData], teamMembersCount);
                    depositAmount = updatedCards[0]?.depositAmount || 0;
                } else if (selectedDeposit.deposit_type === "TransportationDeposit") {
                    depositAmount = parseFloat(selectedDeposit.transaction_amount);
                }
            }

            if (depositAmount <= 0) throw new Error("유효하지 않은 입금 금액입니다.");

            const menuNameDefault = isDeductedOpen
                ? "여비교통비 차감"
                : selectedDeposit.deposit_type === "TeamFund"
                ? "팀 운영비"
                : "월 잔액 충전";

            const transactionData = {
                card_id: selectedCardId,
                merchant_name: "관리자",
                menu_items: [{
                    name: state.selectedDeposit?.menu_items[0]?.name || menuNameDefault,
                    price: depositAmount,
                    quantity: 1
                }],
                transaction_type: transactionType,
                deposit_type: selectedDeposit?.deposit_type,
                is_deducted: isDeductedOpen,
                transaction_date: selectedDeposit?.transaction_date || new Date(),
            };

            console.log('transactionData', transactionData);

            if (isEditing) {
                await axios.put(
                    `${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`,
                    transactionData
                );
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }

            await fetchData(`${API_URLS.DEPOSITS}/${currentYear}/${currentMonth}`, 'deposits');
            
            setState(prev => ({ ...prev, isOpen: false, errMsg: "" }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: error.response?.data?.message || error.message }));
        }
    };

    const handleDepositTypeChange = async (e) => {
        const newDepositType = e.target.value;
        setState(prev => ({
            ...prev,
            selectedDeposit: {
                ...prev.selectedDeposit,
                deposit_type: newDepositType,
                menu_items: [{
                    name: "", // 기본값으로 빈 문자열 설정
                    price: 0, // 기본값으로 가격 0 설정
                    quantity: 1 // 기본값으로 수량 1 설정
            }],
            transaction_amount: 0 // 기본값으로 초기화
        }
        }));

        const { accounts, selectedUserId, selectedUser } = state;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 선택된 사용자 계좌 필터링
        const userAccount = accounts.find(account =>
            account.cards.some(card => card.member_id === selectedUserId)
        );

        if (!userAccount) {
            console.error("사용자 계좌를 찾을 수 없습니다.");
            return;
        }

        const userCard = userAccount.cards.find(card => card.member_id === selectedUserId);
        if (!userCard) {
            console.error("사용자 카드 정보를 찾을 수 없습니다.");
            return;
        }

        const cardLimit = userCard.limit || 0;
        const cardBalance = userCard.balance || 0;
        const teamMembersCount = calculateUniqueTeamMembersCount(state.accounts);

        let depositAmount = 0;

        try {
            const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${userCard.card_id}`);
            const cardTransactions = transactionsResponse.data || [];

            const filteredMonthTransactions = cardTransactions.filter(tx => {
                const transactionDate = new Date(tx.transaction_date);
                return (
                    transactionDate.getMonth() === currentMonth &&
                    transactionDate.getFullYear() === currentYear &&
                    tx.transaction_type === "income" 
                );
            });

            const hasTeamFund = filteredMonthTransactions.some(tx => tx.deposit_type === "TeamFund");
            const hasRegularDeposit = filteredMonthTransactions.some(tx => tx.deposit_type === "RegularDeposit");

            if (newDepositType && !state.isEditing) {
                if (newDepositType === "RegularDeposit") {
                    // RegularDeposit 조건
                    if (hasRegularDeposit) {
                        depositAmount = 0;
                    } else {
                        const usageQuota = 10000 / teamMembersCount; // 팀원 기준 사용 가능 금액
                        depositAmount = cardBalance > usageQuota
                            ? Math.max(0, cardLimit - cardBalance) // 잔액이 quota보다 큰 경우 limit - 잔액
                            : cardLimit; // 잔액이 quota 이하라면 card.limit
                    }
                } else if (newDepositType === "TeamFund") {
                    // TeamFund 조건
                    if (hasTeamFund) {
                        depositAmount = 0;
                    } else {
                        const isTeamLeader = state.selectUserPosition === "팀장";
                        const isPartLeader = state.selectUserPosition === "파트장";
                        depositAmount = isTeamLeader
                            ? teamMembersCount * 30000 // 팀장일 경우 팀원 수 * 30000
                            : isPartLeader
                                ? 30000 // 파트장일 경우 30000
                                : ''; // 기타
                    }
                } else if (newDepositType === "TransportationDeposit") {
                    // 교통비는 로직 추가 가능
                    depositAmount = '';
                }
            }

            const currentMonthName = new Date().toLocaleString("ko-KR", { month: "long" });
            const userName = selectedUser?.member_name || '';
            const teamName = selectedUser?.team_id?.team_name || "팀";
            let depositItems = []; // menu_items 배열로 변경

            if (newDepositType === "RegularDeposit") {
                depositItems.push({
                    name: `${userName}님 ${currentMonthName} ${teamName} 팀비`, // name 속성
                    price: depositAmount, // 자동으로 계산된 depositAmount 사용
                    quantity: 1 // 기본값으로 수량 1 설정
                });
            } else if (newDepositType === "TeamFund") {
                depositItems.push({
                    name: `${currentMonthName} ${teamName} 팀운영비`, // name 속성
                    price: depositAmount, // 자동으로 계산된 depositAmount 사용
                    quantity: 1 // 기본값으로 수량 1 설정
                });
            }

            // menu_items에 depositItems 할당
            setState(prev => ({
                ...prev,
                selectedDeposit: {
                    ...prev.selectedDeposit,
                    menu_items: depositItems, // depositItems를 menu_items에 할당
                    transaction_amount: depositAmount // 계산된 depositAmount로 업데이트
                }
            }));
        } catch (error) {
            console.error("트랜잭션 데이터 로드 실패", error);
        }
    };

    const handleDelete = async () => {
        try {
            const { selectedDeposit } = state;

            if (!selectedDeposit || !selectedDeposit._id) {
                setState(prev => ({ ...prev, errMsg: "선택된 입금 내역이 유효하지 않습니다." }));
                return;
            }

            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
            const depositData = response.data;
            const depositDate = new Date(depositData.transaction_date);
            const depositAmount = parseFloat(depositData.transaction_amount);

            const cardResponse = await axios.get(`${API_URLS.CARDS}/${depositData.card_id}`);
            const cardData = cardResponse.data;
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
            const isTeamFund = depositData.deposit_type === 'TeamFund';

            const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${depositData.card_id}`);
            const transactions = transactionsResponse.data;

            const hasPostDepositTransactions = transactions.some(transaction => {
                const transactionDate = new Date(transaction.transaction_date);
                return transactionDate > depositDate && transaction.transaction_type === 'expense';
            });

            if (hasPostDepositTransactions) {
                setState(prev => ({ ...prev, errMsg: "이 입금 이후에 사용된 내역이 있어 삭제할 수 없습니다." }));
                return;
            }

            if (isTeamFund) {
                let updatedTeamFund = Math.max(parseFloat(cardData.team_fund) - depositAmount, 0);
                await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
                    team_fund: updatedTeamFund,
                });
            } else {
                if (updatedBalance - depositAmount < 0) {
                    const remainingAmountToDeduct = depositAmount - updatedBalance;
                    updatedBalance = 0;
                    rolloverAmount = Math.max(rolloverAmount - remainingAmountToDeduct, 0);
                } else {
                    updatedBalance -= depositAmount;
                }

                await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
                    balance: updatedBalance,
                    rollover_amount: rolloverAmount,
                });
            }

            await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
            setState(prev => ({ ...prev, isDeleteConfirmOpen: false, errMsg: "", isOpen: false }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: "삭제 중 오류가 발생했습니다." }));
        }
    };

    const handleAddDeposit = () => {
        setState(prev => ({
            ...prev,
            selectedDeposit: { transaction_amount: "" },
            selectedUserId: "",
            selectedCardId: "",
            isEditing: false,
            isOpen: true,
        }));
    };

    const handleMinusDeposit = () => {
        setState(prev => ({
            ...prev,
            selectedDeposit: { transaction_amount: "" },
            selectedUserId: "",
            selectedCardId: "",
            isEditing: false,
            isDeductedOpen: true,
        }));
    };

    return (
        <>
            <AdminHeader />
            <div className="flex-1 w-full p-4 sm:p-6 dark:bg-gray-800">
                    <div className="flex items-center justify-between mt-2 mb-4 px-3">
                        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">입출금 거래내역</h5>
                        <div className='flex gap-x-3'>
                            <button
                                type="button"
                                className="text-black font-semibold rounded-lg text-2xl dark:text-white"
                                onClick={handleAddDeposit}
                            >
                                <IoAddCircleOutline />
                            </button>
                            <button
                                type="button"
                                className="text-black font-semibold rounded-lg text-2xl dark:text-white"
                                onClick={handleMinusDeposit}
                            >
                                <TbCircleMinus />
                            </button>
                        </div>
                    </div>

                    <div className="flow-root">
                        <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
                            {state.deposits.length === 0 ? (
                                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                    데이터가 없습니다.
                                </div>
                            ) : (
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {state.deposits.map(deposit => (
                                        <li key={deposit._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(deposit)}>
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
                </div>
            </div>

                {/* 삭제 모달 : 추후 컴포넌트로 변경 */}
                {state.isDeleteConfirmOpen && (
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

                {/* Drawer: 입금 관리 */}
                <CommonDrawer isOpen={state.isOpen} onClose={handleCloseDrawer} title={state.isEditing ? '입금 수정' : '입금 추가'}>
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                        {state.errMsg && <div className="text-red-600 dark:text-red-300">{state.errMsg}</div>} {/* 에러 메시지 표시 */}

                        {/* 사용자 선택 */}
                        <SelectField
                            label="사용자"
                            id="member_id"
                            value={state.isEditing ? state.selectedDeposit?.card_id?.member_id : state.selectedUserId || ""}
                            onChange={handleUserChange}
                            options={state.users.map(member => ({
                                value: member._id,
                                label: member.member_name
                            }))}
                            placeholder="사용자 선택"
                            required
                        />

                        {/* 카드 선택 */}
                        <SelectField
                            label="카드"
                            id="card_id"
                            value={state.isEditing ? state.selectedDeposit?.card_id?._id : state.selectedCardId || ""}
                            onChange={handleCardChange}
                            options={state.cards.map(card => ({ value: card._id, label: card.card_number}))}
                            placeholder="카드 선택"
                            disabled={!state.selectedUserId}
                            required
                        />

                        <div>
                            <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-slate-300 dark:font-normal">입금 구분</h3>
                            <ul className="grid w-full gap-2 grid-cols-2">
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_a"
                                        name="deposit_type"
                                        value="RegularDeposit"
                                        className="hidden peer"
                                        checked={state.selectedDeposit.deposit_type === 'RegularDeposit'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!state.selectedCardId || state.selectedUser?.hasRegularDeposit}
                                        required
                                    />
                                    <label
                                        htmlFor="deposit_type_a"
                                        className={`${!state.selectedCardId || state.selectedUser?.hasRegularDeposit ? 
                                            'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 
                                            'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">정기 입금</div>
                                            <div className="w-full text-sm">10만원</div>
                                        </div>
                                        {state.selectedDeposit.deposit_type === 'RegularDeposit' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_b"
                                        name="deposit_type"
                                        value="TransportationDeposit" 
                                        className="hidden peer"
                                        checked={state.selectedDeposit.deposit_type === 'TransportationDeposit'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!state.selectedCardId}
                                    />
                                    <label
                                        htmlFor="deposit_type_b"
                                        className={`${!state.selectedCardId ? 
                                            'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 
                                            'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">여비교통비</div>
                                            <div className="w-full text-sm">금액입력</div>
                                        </div>
                                        {state.selectedDeposit.deposit_type === 'TransportationDeposit' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                {(state.selectUserPosition === '팀장' || state.selectUserPosition === '파트장') && (
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_c"
                                        name="deposit_type"
                                        value="TeamFund" 
                                        className="hidden peer"
                                        checked={state.selectedDeposit.deposit_type === 'TeamFund'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!state.selectedCardId || state.selectedUser?.hasTeamFund}
                                    />
                                    <label
                                        htmlFor="deposit_type_c"
                                        className={`${!state.selectedCardId || state.selectedUser?.hasTeamFund ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">팀운영비</div>
                                            <div className="w-full text-sm">팀원당 3만원</div>
                                        </div>
                                        {state.selectedDeposit.deposit_type === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                )}
                            </ul>
                        </div>

                        {/* 입금 금액 입력 */}
                        <div>
                            <InputField
                                label="입금 금액"
                                type="number"
                                id="transaction_amount"
                                value={state.selectedDeposit.transaction_amount }
                                className={"bg-white border border-slate-200"}
                                onChange={(e) => 
                                    setState(prevState => ({
                                        ...prevState,
                                        selectedDeposit: {
                                            ...prevState.selectedDeposit,
                                            transaction_amount: Number(e.target.value)
                                        }
                                    }))
                                }
                                placeholder="입금 금액 입력"
                                required={true}
                                disabled={!state.selectedDeposit.deposit_type}
                            />
                            {state.selectUserPosition === '팀장' && state.selectedDeposit.deposit_type === "TeamFund" && (
                                <div className="mt-2 text-gray-500">
                                    <span>팀 인원: {calculateUniqueTeamMembersCount(state.accounts)}명</span> {/* 팀원 수만 표시 */}
                                </div>
                            )}
                        </div>

                        <InputField
                            label="입금명"
                            id="menu_name"
                            value={state.selectedDeposit?.menu_items?.[0]?.name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => {
                                const newMenuItems = state.selectedDeposit.menu_items || [{ name: "", price: 0, quantity: 1 }]; // 기본값 설정
                                setState(prevState => ({
                                    ...prevState,
                                    selectedDeposit: {
                                        ...prevState.selectedDeposit,
                                        menu_items: [{
                                            ...newMenuItems[0], // 기존 객체를 유지
                                            name: e.target.value, // name만 수정
                                        }],
                                    },
                                }));
                            }}
                            placeholder="입급명 입력"
                            disabled={!state.selectedDeposit.deposit_type}
                        />

                        <InputField 
                            label="거래일" 
                            id="transaction_date" 
                            type='date'
                            value={state.selectedDeposit?.transaction_date?.split("T")[0] || new Date().toISOString().split('T')[0]}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => 
                                setState(prevState => ({
                                    ...prevState,
                                    selectedDeposit: {
                                        ...prevState.selectedDeposit,
                                        transaction_date: e.target.value 
                                    },
                                }))
                            }
                            placeholder=""
                            disabled={!state.selectedDeposit.deposit_type}
                            required={true}
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6">
                        <div className='flex justify-between gap-y-4 gap-x-2'>
                            {!state.isEditing ? '' : <button
                                type="button" 
                                className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg'
                                onClick={handleDeleteConfirm}
                            >삭제</button>
                            }
                            <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {state.isEditing ? '수정' : '추가'}
                            </button>
                        </div>
                        <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                            취소
                        </button>
                    </div>
                </CommonDrawer>

                {/* Drawer: 차감 관리 */}
                <CommonDrawer isOpen={state.isDeductedOpen} onClose={handleCloseDrawer} title={state.isEditing ? '차감 수정' : '차감 추가'}>
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                        {state.errMsg && <div className="text-red-600 dark:text-red-300">{state.errMsg}</div>} {/* 에러 메시지 표시 */}

                        {/* 사용자 선택 */}
                        <SelectField
                            label="사용자"
                            id="member_id"
                            value={state.isEditing ? state.selectedDeposit?.card_id?.member_id : state.selectedUserId || ""}  // selectedUserId 상태로 설정
                            onChange={handleUserChange}
                            options={state.users.map(member => ({
                                value: member._id,
                                label: member.member_name
                            }))}
                            placeholder="사용자 선택"
                            required
                        />

                        {/* 카드 선택 */}
                        <SelectField
                            label="카드"
                            id="card_id"
                            value={state.isEditing ? state.selectedDeposit?.card_id?._id : state.selectedCardId || ""}
                            onChange={handleCardChange}
                            options={state.cards.map(card => ({ value: card._id, label: card.card_number}
                            ))}
                            placeholder="카드 선택"
                            disabled={!state.selectedUserId}
                            required
                        />
                        <div>
                            <h3 className="mb-2 text-md font-medium text-gray-900 dark:text-slate-300 dark:font-normal">차감 구분</h3>
                            <ul className="grid w-full gap-2 grid-cols-2">
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_b"
                                        name="deposit_type"
                                        value="TransportationExpense" // "여비교통비"
                                        className="hidden peer"
                                        checked={state.selectedDeposit.deposit_type === 'TransportationExpense'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!state.selectedCardId}
                                    />
                                    <label
                                        htmlFor="deposit_type_b"
                                        className={`${!state.selectedCardId ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">여비교통비</div>
                                            <div className="w-full text-sm">금액입력</div>
                                        </div>
                                        {state.selectedDeposit.deposit_type === 'TransportationExpense' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                            </ul>
                        </div>

                        <InputField
                            label="차감 금액"
                            type="number"
                            id="transaction_amount"
                            value={state.selectedDeposit.transaction_amount }
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => 
                                setState(prevState => ({
                                    ...prevState,
                                    selectedDeposit: {
                                        ...prevState.selectedDeposit,
                                        transaction_amount: Number(e.target.value)
                                    }
                                }))
                            }
                            placeholder="차감 금액 입력"
                            required={true}
                            disabled={!state.selectedDeposit.deposit_type}
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6">
                        <div className='flex justify-between gap-y-4 gap-x-2'>
                            {!state.isEditing ? '' : <button
                                type="button" 
                                className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg'
                                onClick={handleDeleteConfirm}
                            >삭제</button>
                            }
                            <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {state.isEditing ? '수정' : '차감'}
                            </button>
                        </div>
                        <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                            취소
                        </button>
                    </div>
                </CommonDrawer>
        </>
    );
};

export default AdminDeposit;
