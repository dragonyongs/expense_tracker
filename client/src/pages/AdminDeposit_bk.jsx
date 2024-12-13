import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import { API_URLS } from '../services/apiUrls';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import { TbCircleMinus } from "react-icons/tb";

import AdminHeader from '../components/AdminHeader';

const AdminDeposit = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [depositType, setDepositType] = useState(''); // 초기값 빈 문자열
    const [selectedCard, setSelectedCard] = useState(null); // 선택된 카드
    const [teamFundAmount, setTeamFundAmount] = useState(0); // 팀 운영비 계산 금액
    const [selectUserPosition, setSelectUserPosition] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUser, setSelectedUser] = useState({});
    const [deposits, setDeposits] = useState([]);
    const [balance, setBalance] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState({
        _id: "",
        member_name: "",
        card_id: "",
        merchant_name: "",
        menu_name: "",
        transaction_date: "",
        transaction_amount: "", 
        transaction_type: "",
        deposit_type: "RegularDeposit",
        is_deducted: false,
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeductedOpen, setIsDeductedOpen] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    useEffect(() => {
        fetchFilteredMembers();
    }, []);
    
    const fetchData = async (url, setState) => {
        setLoading(true);
    
        try {
            const response = await axios.get(url, { withCredentials: true });
    
            if (url.includes(API_URLS.DEPOSITS)) {
                const sortedDeposits = response.data.sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    if (dateA > dateB) return -1;
                    if (dateA < dateB) return 1;
    
                    const transDateA = new Date(a.transaction_date);
                    const transDateB = new Date(b.transaction_date);
                    if (transDateA > transDateB) return -1;
                    if (transDateA < transDateB) return 1;
    
                    return 0;
                });
    
                setState(sortedDeposits);
            } else {
                setState(response.data);
            }
        } catch (error) {
            setErrMsg(`데이터 로드 중 오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(`${API_URLS.DEPOSITS}/${currentYear}/${currentMonth}`, setDeposits);
        if (isOpen || isDeleteConfirmOpen) {
            fetchFilteredMembers();
        }
    }, [currentYear, currentMonth]);

    useEffect(() => {
        if (isOpen || isDeleteConfirmOpen) {
            fetchFilteredMembers();
        }
    }, [isOpen, isDeleteConfirmOpen]);
    
    useEffect(() => {
        if (selectedUserId) {
            fetchData(`${API_URLS.MEMBERS}/${selectedUserId}`, setSelectedUser);
            fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}/${selectedUserId}`, setAccounts);
        }
    }, [selectedUserId]);
    
    // 팀원 수 계산 함수
    const calculateTeamMembersCount = () => accounts.reduce((count, account) => count + account.cards.length, 0);

    const handleDepositTypeChange = (e) => {
        const newDepositType = e.target.value;
        setDepositType(newDepositType);
    
        const teamMembersCount = calculateTeamMembersCount();
        const currentBalance = balance;
        const cardLimit = cards.find(card => card._id === selectedCard)?.limit || 0;
    
        // 입금 금액 계산 로직
        let depositAmount = 0;
        if (newDepositType === "RegularDeposit") {
            const usageQuota = Number(10000) / teamMembersCount;
            depositAmount = currentBalance > usageQuota 
                ? Math.max(0, cardLimit - currentBalance) 
                : cardLimit;
        } else if (newDepositType === "TeamFund") {
            const isTeamLeader = selectUserPosition === "팀장";
            const isPartLeader = selectUserPosition === "파트장";
            depositAmount = isTeamLeader 
                ? teamMembersCount * 30000 
                : isPartLeader 
                    ? 30000 
                    : 0;
        } else if (newDepositType === "TransportationExpense") {
            depositAmount = ''; // 교통비는 빈 값으로 처리
        }
    
        // 입금명 설정 로직
        const currentMonth = new Date().toLocaleString("ko-KR", { month: "long" });
        const userName = selectedUser?.member_name || '';
        const teamName = selectedUser?.team_id?.team_name || "팀";
        let depositName = "";
    
        if (newDepositType === "RegularDeposit") {
            depositName = `${userName}님 ${currentMonth} ${teamName} 팀비`;
        } else if (newDepositType === "TeamFund") {
            depositName = `${currentMonth} ${teamName} 팀운영비`;
        }
    
        // 상태 업데이트
        setSelectedDeposit(prev => ({
            ...prev,
            deposit_type: newDepositType,
            transaction_amount: depositAmount,
            menu_name: depositName,
        }));
    };

    useEffect(() => {
        // selectedUserId가 변경되었을 때 실행
        if (selectedUserId && depositType === "RegularDeposit" && selectedCard) {
            
            const currentBalance = balance; // 현재 잔액
            const cardLimit = cards.find(card => card._id === selectedCard)?.limit || 0;
            const teamMembersCount = calculateTeamMembersCount(); // 팀원 수 계산
            const usageQuota = (10000 / teamMembersCount); // 각 팀원이 사용할 수 있는 기본 금액
    
            // 잔액이 사용 가능한 금액보다 클 경우
            if (currentBalance > usageQuota) {
                const depositAmount = Math.max(0, cardLimit - currentBalance); // 카드 한도에서 현재 잔액 차감
                setSelectedDeposit(prev => ({
                    ...prev,
                    transaction_amount: depositAmount,
                }));
            } else {
                setSelectedDeposit(prev => ({
                    ...prev,
                    transaction_amount: cardLimit, // 카드 한도만큼 설정
                }));
            }
        } else if (depositType === "TransportationExpense" && selectedCard) {
            setSelectedDeposit(prev => ({
                ...prev,
                transaction_amount: '',
            }));
        }
    }, [selectedUserId, depositType, selectedCard, cards, balance]);

    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    const handleDelete = async () => {
        try {
    
            // 선택된 입금 내역의 금액과 카드 정보 조회
            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
            const depositData = response.data;
            const depositDate = new Date(depositData.transaction_date); // 입금된 날짜
            const depositAmount = parseFloat(depositData.transaction_amount);
    
            // 해당 입금 내역의 카드 정보 조회
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${depositData.card_id}`);
            const cardData = cardResponse.data;
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
            const isTeamFund = depositData.deposit_type === 'TeamFund'; // 팀 운영비 여부 체크
    
            // 해당 입금 이후의 거래 내역이 있는지 확인
            const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${depositData.card_id}`);
            const transactions = transactionsResponse.data;
    
            // 입금 이후에 발생한 거래가 있는지 확인
            const hasPostDepositTransactions = transactions.some(transaction => {
                const transactionDate = new Date(transaction.transaction_date);
                return transactionDate > depositDate && transaction.transaction_type === 'expense';
            });
    
            if (hasPostDepositTransactions) {
                setErrMsg("이 입금 이후에 사용된 내역이 있어 삭제할 수 없습니다.");
                console.warn('입금 이후 사용 내역이 있어 삭제가 불가능합니다.');
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
            console.log('입금 내역 삭제 완료');
            fetchData(`${API_URLS.DEPOSITS}`, setDeposits);
            setIsDeleteConfirmOpen(false);
            handleCloseDrawer();
        } catch (error) {
            setErrMsg("삭제 중 오류가 발생했습니다.");
            console.error('삭제 중 오류:', error);
        }
    };

    const fetchFilteredMembers = async () => {
        try {
            const [cardsResponse, membersResponse, depositsResponse] = await Promise.all([
                axios.get(API_URLS.CARDS),
                axios.get(API_URLS.FILTERED_MEMBERS),
                axios.get(API_URLS.DEPOSITS),
            ]);
    
            const allCards = cardsResponse.data;
            const allMembers = membersResponse.data;
            const allDeposits = depositsResponse.data;
    
            // 유효 카드와 사용자 ID 매핑
            const validCards = allCards.filter(card => card.member_id && card.card_number);
            const validMemberIds = validCards.map(card => card.member_id._id);
    
            // 이번 달 필터링
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
    
            const depositsThisMonth = allDeposits.filter(deposit => {
                const depositDate = new Date(deposit.createdAt);
                return (
                    depositDate.getMonth() + 1 === currentMonth &&
                    depositDate.getFullYear() === currentYear
                );
            });
    
            // 입금 유형에 따른 사용자 ID 수집
            const membersWithRegularDeposit = depositsThisMonth
                .filter(deposit => deposit.deposit_type === 'RegularDeposit')
                .map(deposit => deposit.card_id.member_id);
    
            const membersWithTeamFund = depositsThisMonth
                .filter(deposit => deposit.deposit_type === 'TeamFund')
                .map(deposit => deposit.card_id.member_id);
    
            // 입금 상태를 효율적으로 관리하기 위한 객체 생성
            const depositStatusMap = {};
            allMembers.forEach(member => {
                depositStatusMap[member._id] = {
                    hasRegularDeposit: membersWithRegularDeposit.includes(member._id),
                    hasTeamFund: membersWithTeamFund.includes(member._id),
                };
            });
    
            // 필터링된 사용자 목록 생성 
            
            const filteredMembers = allMembers
                .filter(member => validMemberIds.includes(member._id))
                .map(member => ({
                    ...member,
                    ...depositStatusMap[member._id], // 입금 상태 추가
                }));

                
    
            // UI에서 라디오 버튼 조건부 노출
            const updatedMembers = filteredMembers.map(member => ({
                ...member,
                showRadioButton: !depositStatusMap[member._id].hasRegularDeposit,
            }));
    
            setUsers(updatedMembers);
        } catch (error) {
            setErrMsg("사용자 목록을 불러오지 못했습니다.");
        }
    };

    const handleAddDeposit = () => {
        setSelectedDeposit({ transaction_amount: "" });
        setSelectedUserId("");
        setSelectedCard("");
        setIsEditing(false);
        setIsOpen(true);
    };

    const handleMinusDeposit = () => {
        setSelectedDeposit({ transaction_amount: "" });
        setSelectedUserId("");
        setSelectedCard("");
        setIsEditing(false);
        setIsDeductedOpen(true);
    };

    // 사용자 선택 핸들러
    const handleUserChange = async (e) => {
        const changeUserId = e.target.value;
        setSelectedUserId(changeUserId); // 사용자를 선택하면 상태에 저장

        try {
            // 선택한 사용자의 ID로 카드 목록 필터링
            const response = await axios.get(`${API_URLS.CARDS}/member/${changeUserId}`);
            const userCards = response.data;
            

             // 사용자 직책 정보 가져오기
            const userPosition = userCards[0]?.member_id?.position || "";
            setSelectUserPosition(userPosition); // 사용자 직책 업데이트

            if (userCards.length > 0) {
                setCards(userCards); // 카드 목록 업데이트
                setSelectedCard(userCards[0]._id); // 첫 번째 카드를 자동으로 선택
                setBalance(userCards[0].balance); // 카드 잔액 설정
                // 선택된 사용자 및 카드 정보 업데이트
                setSelectedDeposit((prev) => ({
                    ...prev,
                    position: userCards[0].member_id.position,
                    member_id: changeUserId,
                    card_id: userCards[0]._id, // 첫 번째 카드 ID로 설정
                }));
            } else {
                setCards([]); // 카드가 없으면 빈 배열로 설정
                setSelectedCard(""); // 선택된 카드 해제
                setBalance(0); // 잔액도 0으로 설정
    
                // 선택된 사용자 및 카드 정보 업데이트
                setSelectedDeposit((prev) => ({
                    ...prev,
                    member_id: changeUserId,
                    card_id: '', // 카드 ID 초기화
                }));
            }

        } catch (error) {
            setErrMsg("카드 목록을 불러오지 못했습니다.");
        }
    };

    // 카드 선택 핸들러
    const handleCardChange = (e) => {
        const cardId = e.target.value;
        const card = cards.find(card => card._id === cardId);
    
        if (card) {
            setSelectedCard(cardId);
            setBalance(card.balance);
            setDepositType(card.deposit_type || 'RegularDeposit');
        }

    };

    const handleSave = async () => {
        try {
            setErrMsg("");
            if (!selectedUserId || !selectedCard || !depositType || !selectedDeposit.transaction_amount) {
                setErrMsg("모든 필드를 채워주세요.");
                return;
            }

            const transactionAmount = selectedDeposit.transaction_amount;
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${selectedCard}`);
            const cardData = cardResponse.data;

            const transactionType = isDeductedOpen ? "expense" : "income";
            let depositAmount = parseFloat(transactionAmount);

            if (!isDeductedOpen) {
                if (depositType === "RegularDeposit") {
                    const teamMembersCount = calculateTeamMembersCount();
                    const updatedCards = calculateTeamDepositAmount([cardData], teamMembersCount);
                    depositAmount = updatedCards[0]?.depositAmount || 0;
                } else if (depositType === "TransportationExpense") {
                    depositAmount = parseFloat(selectedDeposit.transaction_amount);
                }
            }

            if (depositAmount <= 0) throw new Error("유효하지 않은 입금 금액입니다.");

            const menuNameDefault = isDeductedOpen
                ? "여비교통비 차감" // 차감인 경우
                : depositType === "TeamFund"
                ? "팀 운영비" // 팀펀드 입금
                : "월 잔액 충전"; // 기본 입금
            const transactionData = {
                card_id: selectedCard,
                transaction_amount: depositAmount,
                merchant_name: "관리자",
                menu_name:
                    selectedDeposit?.menu_name || menuNameDefault,
                transaction_type: transactionType,
                deposit_type: depositType,
                is_deducted: isDeductedOpen,
                transaction_date: selectedDeposit?.transaction_date || new Date(),
            };

            if (isEditing) {
                await axios.put(
                    `${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`,
                    transactionData
                );
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }

            // fetchData(API_URLS.DEPOSITS, setDeposits);
            handleCloseDrawer();
        } catch (error) {
            console.error("입금 처리 중 오류:", error);
            setErrMsg(error.response?.data?.message || error.message);
        }
    };    
        const calculateTeamDepositAmount = (cards, teamMembersCount) => {
        const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
        const threshold = 10000 / teamMembersCount; // 1인당 기준 금액

        return cards.map((card) => {
            const remainingAmount = Math.max(0, 100000 - card.balance); // 잔액 기준 차감
            if (totalBalance < 10000) {
                // 총 잔액이 1만 원 미만일 경우 카드 한도에 따라 10만 원 입금
                return {
                    ...card,
                    depositAmount: 100000,
                };
            } else if (card.balance < threshold) {
                // 잔액이 기준 미만인 경우만 10만 원 - 현재 잔액 입금
                return {
                    ...card,
                    depositAmount: remainingAmount,
                };
            } else {
                // 기준 이상인 경우 입금하지 않음
                return {
                    ...card,
                    depositAmount: 0,
                };
            }
        });
    };
    
    // 드로어 열 때 카드 정보 업데이트
    const handleOpenDrawer = async (deposit) => {
        const memberId = deposit?.card_id?.member_id || null;
        const cardId = deposit?.card_id?._id || null;
        
        // 카드 정보 가져오기
        try {
            console.log('deposit', deposit);

            const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
            const cardTransactions = transactionsResponse.data;
            const depositType = deposit?.deposit_type || "RegularDeposit";

            const response = await axios.get(`${API_URLS.CARDS}/member/${memberId}`);
            const userCards = response.data;
            setCards(userCards);
    
            let transactionAmount = deposit?.transaction_amount || 0;

            if (cardTransactions.length === 0) {
                transactionAmount = depositType === "TeamFund" ? 30000 : 100000;
            } else if (deposit?.transaction_amount) {
                // 전달된 deposit의 금액이 유효한 경우
                transactionAmount = deposit.transaction_amount;
            }

            setSelectedDeposit({
                ...deposit,
                transaction_amount: transactionAmount, // 초기화된 금액 설정
                deposit_type: depositType,  // 입금 유형 설정
            });

            // 카드 선택 초기화
            setSelectedCard(deposit.card_id); // 선택된 카드 정보 설정
            setSelectedUserId(memberId); // 선택된 사용자 정보 설정
            setDepositType(depositType);
    
            setIsEditing(true);
            setIsOpen(true);
    
        } catch (error) {
            setErrMsg("카드 정보를 가져오는 데 실패했습니다.");
        }
    };

    const handleCloseDrawer = () => {
        setErrMsg('');
        setDepositType('');
        setIsOpen(false);
        setIsDeductedOpen(false);
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
                            {deposits.length === 0 ? (
                                <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                    데이터가 없습니다.
                                </div>
                            ) : (
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {deposits.map(deposit => (
                                        <li key={deposit._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(deposit)}>
                                            <div className="flex items-center py-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                    {new Date(deposit.transaction_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} {deposit.merchant_name} {deposit.transaction_type}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                        {deposit.member_name}님 {deposit.menu_name}
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

                {/* Drawer: 입금 관리 */}
                <CommonDrawer isOpen={isOpen} onClose={handleCloseDrawer} title={isEditing ? '입금 수정' : '입금 추가'}>
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                        {errMsg && <div className="text-red-600 dark:text-red-300">{errMsg}</div>} {/* 에러 메시지 표시 */}

                        {/* 사용자 선택 */}
                        <SelectField
                            label="사용자"
                            id="member_id"
                            value={isEditing ? selectedDeposit?.card_id?.member_id : selectedUserId || ""}
                            onChange={handleUserChange}
                            options={users.map(member => ({
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
                            value={isEditing ? selectedDeposit?.card_id?._id : selectedCard || ""}
                            onChange={handleCardChange}
                            options={cards.map(card => ({ value: card._id, label: card.card_number}
                            ))}
                            placeholder="카드 선택"
                            disabled={!selectedUserId}
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
                                        checked={depositType === 'RegularDeposit'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!selectedCard || selectedUser?.hasRegularDeposit}
                                        required
                                    />
                                    <label
                                        htmlFor="deposit_type_a"
                                        className={`${!selectedCard || selectedUser?.hasRegularDeposit ? 
                                            'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 
                                            'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">정기 입금</div>
                                            <div className="w-full text-sm">10만원</div>
                                        </div>
                                        {depositType === 'RegularDeposit' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_b"
                                        name="deposit_type"
                                        value="TransportationExpense" 
                                        className="hidden peer"
                                        checked={depositType === 'TransportationExpense'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!selectedCard}
                                    />
                                    <label
                                        htmlFor="deposit_type_b"
                                        className={`${!selectedCard ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">여비교통비</div>
                                            <div className="w-full text-sm">금액입력</div>
                                        </div>
                                        {depositType === 'TransportationExpense' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                {/* {(selectUserPosition === '팀장' || selectUserPosition === '파트장') && ( */}
                                    <li>
                                        <input
                                            type="radio"
                                            id="deposit_type_c"
                                            name="deposit_type"
                                            value="TeamFund" 
                                            className="hidden peer"
                                            checked={depositType === 'TeamFund'}
                                            onChange={handleDepositTypeChange}
                                            disabled={!selectedCard || selectedUser?.hasTeamFund}
                                        />
                                        <label
                                            htmlFor="deposit_type_c"
                                            className={`${!selectedCard || selectedUser?.hasTeamFund ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 peer-disabled:bg-slate-50 peer-disabled:text-gray-300`}
                                        >
                                            <div className="block">
                                                <div className="w-full text-md font-semibold">팀운영비</div>
                                                <div className="w-full text-sm">팀원당 3만원</div>
                                            </div>
                                            {depositType === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                        </label>
                                    </li>
                                {/* )} */}
                            </ul>
                        </div>

                        {/* 입금 금액 입력 */}
                        <div>
                            <InputField
                                label="입금 금액"
                                type="number"
                                id="transaction_amount"
                                value={selectedDeposit.transaction_amount } // 자동 계산된 금액
                                className={"bg-white border border-slate-200"}
                                onChange={(e) => setSelectedDeposit(prev => ({
                                    ...prev,
                                    transaction_amount: Number(e.target.value)
                                }))}
                                placeholder="입금 금액 입력"
                                required={true}
                                disabled={!depositType}
                            />
                            {selectUserPosition === '팀장' && depositType === "TeamFund" && (
                                <div className="mt-2 text-gray-500">
                                    <span>팀 인원: {calculateTeamMembersCount()}명</span> {/* 팀원 수만 표시 */}
                                </div>
                            )}
                        </div>

                        <InputField
                            label="입금명"
                            id="menu_name"
                            value={selectedDeposit?.menu_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit({ ...selectedDeposit, menu_name: e.target.value })}
                            placeholder="입급명 입력"
                            disabled={!depositType}
                        />

                        <InputField 
                            label="거래일" 
                            id="transaction_date" 
                            type='date'
                            value={selectedDeposit?.transaction_date?.split("T")[0] || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit({ ...selectedDeposit, transaction_date: e.target.value })}
                            placeholder=""
                            disabled={!depositType}
                            required={true}
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6">
                        <div className='flex justify-between gap-y-4 gap-x-2'>
                            {!isEditing ? '' : <button
                                type="button" 
                                className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg'
                                onClick={handleDeleteConfirm}
                            >삭제</button>
                            }
                            <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '추가'}
                            </button>
                        </div>
                        <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                            취소
                        </button>
                    </div>
                </CommonDrawer>

                {/* Drawer: 차감 관리 */}
                <CommonDrawer isOpen={isDeductedOpen} onClose={handleCloseDrawer} title={isEditing ? '차감 수정' : '차감 추가'}>
                    <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                        {errMsg && <div className="text-red-600 dark:text-red-300">{errMsg}</div>} {/* 에러 메시지 표시 */}

                        {/* 사용자 선택 */}
                        <SelectField
                            label="사용자"
                            id="member_id"
                            value={isEditing ? selectedDeposit?.card_id?.member_id : selectedUserId || ""}  // selectedUserId 상태로 설정
                            onChange={handleUserChange}
                            options={users.map(member => ({
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
                            value={isEditing ? selectedDeposit?.card_id?._id : selectedCard || ""}
                            onChange={handleCardChange}
                            options={cards.map(card => ({ value: card._id, label: card.card_number}
                            ))}
                            placeholder="카드 선택"
                            disabled={!selectedUserId}
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
                                        checked={depositType === 'TransportationExpense'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!selectedCard}
                                    />
                                    <label
                                        htmlFor="deposit_type_b"
                                        className={`${!selectedCard ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100`}
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">여비교통비</div>
                                            <div className="w-full text-sm">금액입력</div>
                                        </div>
                                        {depositType === 'TransportationExpense' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                            </ul>
                        </div>

                        <InputField
                            label="입금 금액"
                            type="number"
                            id="transaction_amount"
                            value={selectedDeposit.transaction_amount }
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit(prev => ({
                                ...prev,
                                transaction_amount: Number(e.target.value)
                            }))}
                            placeholder="차감 금액 입력"
                            required={true}
                            disabled={!depositType}
                        />
                    </div>

                    {/* 저장 버튼 */}
                    <div className="flex flex-col gap-3 pt-4 p-6">
                        <div className='flex justify-between gap-y-4 gap-x-2'>
                            {!isEditing ? '' : <button
                                type="button" 
                                className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg'
                                onClick={handleDeleteConfirm}
                            >삭제</button>
                            }
                            <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                {isEditing ? '수정' : '차감'}
                            </button>
                        </div>
                        <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600">
                            취소
                        </button>
                    </div>
                </CommonDrawer>
            </div>
        </>
    );
};

export default AdminDeposit;
