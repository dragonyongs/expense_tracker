import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import { API_URLS } from '../services/apiUrls';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";
import AdminHader from '../components/AdminHader';

// import { MdKeyboardArrowRight } from "react-icons/md";

const AdminDeposit = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [cardTransactions, setCardTransactions] = useState([]);
    const [selectUserPosition, setSelectUserPosition] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCard, setSelectedCard] = useState("");
    const [deposits, setDeposits] = useState([]);
    const [balance, setBalance] = useState('');
    const [depositType, setDepositType] = useState("");
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
    });
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errMsg, setErrMsg] = useState('');


    const fetchData = async (url, setState) => {
        setLoading(true); // 로딩 상태 설정
        
        try {
            const response = await axios.get(url, { withCredentials: true });
    
            if (url === API_URLS.DEPOSITS) {
                const sortedDeposits = response.data.sort((a, b) => {
                    // createdAt을 기준으로 정렬하고, 같은 경우 transaction_date를 기준으로 정렬
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    if (dateA < dateB) return 1; // 내림차순
                    if (dateA > dateB) return -1;
                    
                    // createdAt이 같을 경우 transaction_date로 정렬
                    const transDateA = new Date(a.transaction_date);
                    const transDateB = new Date(b.transaction_date);
                    return transDateB - transDateA; // transaction_date 내림차순
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

    // 사용자 리스트 불러오기
    useEffect(() => {
        fetchData(`${API_URLS.DEPOSITS}`, setDeposits);
        if (isOpen || isDeleteConfirmOpen) {
            fetchFilteredMembers();
        }
    }, [isOpen, isDeleteConfirmOpen]); // Drawer가 열리거나 삭제 모달이 열릴 때만 호출
    
    useEffect(() => {
        // selectUserPosition이 변경될 때마다 해당 값을 확인
    }, [selectUserPosition]);
    
    useEffect(() => {
        if (selectedUser) {
            fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}/${selectedUser}`, setAccounts);
        }
    }, [selectedUser]);
    
    useEffect(() => {
        if (depositType === "TeamFund" && accounts.length > 0) {
            const teamMembersCount = calculateTeamMembersCount();
            const isTeamLeader = selectUserPosition === "팀장";
            const isPartLeader = selectUserPosition === "파트장";
            const teamFundAmount = isTeamLeader ? (teamMembersCount * 30000) : (isPartLeader ? 30000 : 0);
    
            setSelectedDeposit(prev => ({
                ...prev,
                transaction_amount: teamFundAmount,
            }));
        }
    }, [depositType, accounts]);
    

    // 팀원 수 계산 함수
    const calculateTeamMembersCount = () => accounts.reduce((count, account) => count + account.cards.length, 0);
    
    const handleDepositTypeChange = (e) => {
        const newDepositType = e.target.value;
        setDepositType(newDepositType);
    
        // 사용자 포지션을 구해 팀장/파트장 여부 확인
        const isTeamLeader = selectUserPosition === "팀장";
        const isPartLeader = selectUserPosition === "파트장";

        // 팀원 수에 따라 팀장과 파트장에 맞는 금액 계산
        const teamMembersCount = isTeamLeader ? calculateTeamMembersCount() : 0; // 팀장일 경우 팀원 수 계산
        const teamFundAmount = isTeamLeader ? (teamMembersCount * 30000) : (isPartLeader ? 30000 : 0); // 팀장 운영비 계산

        setSelectedDeposit(prev => ({
            ...prev,
            transaction_amount: newDepositType === "RegularDeposit"
                ? 100000 // 정기 입금 금액
                : newDepositType === "TeamFund"
                ? teamFundAmount // 팀 운영비 + 파트장 추가 금액
                : prev.transaction_amount // 다른 경우는 기존 금액 유지
        }));
    };

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
                // 입금 이후에 발생한 거래가 있으면 삭제 방지
                setErrMsg("이 입금 이후에 사용된 내역이 있어 삭제할 수 없습니다.");
                console.warn('입금 이후 사용 내역이 있어 삭제가 불가능합니다.');
                return;
            }
    
            // 입금 내역의 금액을 차감하여 balance 업데이트
            if (isTeamFund) {
                // 팀 운영비인 경우 team_fund에서 차감
                let updatedTeamFund = Math.max(parseFloat(cardData.team_fund) - depositAmount, 0); // 음수가 되지 않도록 보장
    
                // 카드의 team_fund 업데이트
                await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
                    team_fund: updatedTeamFund,
                });
            } else {
                // 일반 카드 잔액에서 차감
                if (updatedBalance - depositAmount < 0) {
                    const remainingAmountToDeduct = depositAmount - updatedBalance;
                    updatedBalance = 0;
                    rolloverAmount = Math.max(rolloverAmount - remainingAmountToDeduct, 0);
                } else {
                    updatedBalance -= depositAmount;
                }
    
                // 카드의 balance와 rollover_amount 업데이트
                await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
                    balance: updatedBalance,
                    rollover_amount: rolloverAmount,
                });
            }
    
            // 입금 내역 삭제
            await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
            console.log('입금 내역 삭제 완료');
    
            // 입금 내역 갱신
            fetchData(`${API_URLS.DEPOSITS}`, setDeposits);
            
            // 삭제 확인 모달 닫기
            setIsDeleteConfirmOpen(false);
            handleCloseDrawer();
        } catch (error) {
            setErrMsg("삭제 중 오류가 발생했습니다.");
            console.error('삭제 중 오류:', error);
        }
    };

    const fetchFilteredMembers = async () => {
        try {
            // 전체 카드 목록을 가져오기
            const cardsResponse = await axios.get(API_URLS.CARDS);
            const allCards = cardsResponse.data;
    
            // member_id가 있는 카드만 필터링
            const validCards = allCards.filter(card => card.member_id && card.card_number);
    
            // 해당 멤버들의 ID를 모은 배열 생성
            const validMemberIds = validCards.map(card => card.member_id._id);
    
            // 전체 멤버 목록 가져오기
            const membersResponse = await axios.get(API_URLS.MEMBERS);
            const allMembers = membersResponse.data;
    
            // 유효한 카드가 있는 멤버들만 필터링
            const filteredMembers = allMembers.filter(member => validMemberIds.includes(member._id));
            setUsers(filteredMembers);
        } catch (error) {
            setErrMsg("사용자 목록을 불러오지 못했습니다.");
        }
    };

    const handleAddDeposit = () => {
        setSelectedDeposit({ transaction_amount: "" });
        setSelectedUser(""); // 선택 초기화
        setSelectedCard(""); // 선택 초기화
        setIsEditing(false);
        setIsOpen(true);
    };

    // 사용자 선택 핸들러
    const handleUserChange = async (e) => {
        const selectedUserId = e.target.value;
        setSelectedUser(selectedUserId); // 사용자를 선택하면 상태에 저장

        try {
            // 선택한 사용자의 ID로 카드 목록 필터링
            const response = await axios.get(`${API_URLS.CARDS}/member/${selectedUserId}`);
            const userCards = response.data;
            setSelectUserPosition(userCards[0].member_id.position); // 추후 삭제

            if (userCards.length > 0) {
                setCards(userCards); // 카드 목록 업데이트
                setSelectedCard(userCards[0]._id); // 첫 번째 카드를 자동으로 선택
                setBalance(userCards[0].balance); // 카드 잔액 설정

                // 선택된 사용자 및 카드 정보 업데이트
                setSelectedDeposit((prev) => ({
                    ...prev,
                    position: userCards[0].member_id.position,
                    member_id: selectedUserId,
                    card_id: userCards[0]._id, // 첫 번째 카드 ID로 설정
                }));
            } else {
                setCards([]); // 카드가 없으면 빈 배열로 설정
                setSelectedCard(""); // 선택된 카드 해제
                setBalance(0); // 잔액도 0으로 설정
    
                // 선택된 사용자 및 카드 정보 업데이트
                setSelectedDeposit((prev) => ({
                    ...prev,
                    member_id: selectedUserId,
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
    
        // if (card) {
            setSelectedCard(cardId);
            setBalance(card ? card.balance : 0);
            setSelectedDeposit(prev => ({ ...prev, card_id: cardId }));
        // }
    };

    // 입금 저장 처리
    const handleSave = async () => {
        try {
            setErrMsg('');
    
            // 선택된 카드 정보 가져오기
            if (!selectedCard) throw new Error("선택된 카드가 없습니다.");
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${selectedCard}`);
            const cardData = cardResponse.data;
            
            const isTeamFund = selectedDeposit.deposit_type === 'TeamFund';
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
            let teamFund = parseFloat(cardData.team_fund);
            const depositAmount = parseFloat(selectedDeposit.transaction_amount);
            
            // 입금 금액 유효성 검사
            if (depositAmount <= 0) throw new Error("입금 금액은 0보다 커야 합니다.");
            
            // 트랜잭션 데이터 준비
            let existingDeposit = null;
            let depositDate = new Date();
            if (isEditing) {
                // 수정 모드일 경우 기존 입금 내역 가져오기
                const existingDepositResponse = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
                existingDeposit = existingDepositResponse.data;
                depositDate = new Date(existingDeposit.transaction_date);
                
                // 해당 카드의 모든 트랜잭션 조회
                const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${selectedCard}`);
                const transactions = transactionsResponse.data;
    
                // 입금 이후에 발생한 거래가 있는지 확인
                const hasPostDepositTransactions = transactions.some(transaction => {
                    const transactionDate = new Date(transaction.transaction_date);
                    return transactionDate > depositDate && transaction.transaction_type === 'expense';
                });
                
                if (hasPostDepositTransactions) {
                    setErrMsg("이 입금 이후에 사용된 내역이 있어 수정할 수 없습니다.");
                    return;
                }
            }
    
            // 금액 차이를 계산하여 처리
            const difference = isEditing ? depositAmount - parseFloat(existingDeposit.transaction_amount) : depositAmount;
            
            // 팀 운영비 처리
            if (isTeamFund) {
                if (teamFund + difference < 0) throw new Error("팀 운영비가 부족합니다.");
                teamFund += difference;
            } else {
                // 일반 카드 잔액 처리
                if (updatedBalance + difference > 100000) {
                    const excess = updatedBalance + difference - 100000;
                    rolloverAmount += excess;
                    updatedBalance = 100000;
                } else if (updatedBalance + difference < 0) {
                    throw new Error("잔액이 부족합니다.");
                } else {
                    updatedBalance += difference;
                }
            }
            
            // 트랜잭션 업데이트 또는 새로운 트랜잭션 추가
            const transactionData = {
                card_id: selectedCard,
                transaction_amount: depositAmount,
                merchant_name: '관리자',
                menu_name: selectedDeposit?.menu_name || "월 잔액 충전",
                transaction_type: 'income',
                transaction_date: selectedDeposit?.transaction_date || new Date(),
                deposit_type: selectedDeposit?.deposit_type || 'RegularDeposit',
                team_fund: teamFund,
            };
    
            if (isEditing) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`, transactionData);
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }
    
            // 카드 정보 업데이트
            await axios.put(`${API_URLS.CARDS}/${selectedCard}`, {
                balance: updatedBalance,
                rollover_amount: rolloverAmount,
                team_fund: teamFund,
            });
    
            // 상태 값 업데이트 및 모달 닫기
            console.log("카드 잔액 및 rollover_amount 업데이트 성공:", updatedBalance, rolloverAmount, teamFund);
            setBalance(updatedBalance);
            fetchData(`${API_URLS.DEPOSITS}`, setDeposits);
            handleCloseDrawer();
        } catch (error) {
            console.error('입금 처리 중 오류:', error);
            const message = error.response?.data?.message || error.message;
            setErrMsg(message);
        }
    };
    
    // 드로어 열 때 카드 정보 업데이트
    const handleOpenDrawer = async (deposit) => {
        const memberId = deposit?.card_id?.member_id || null;
        const cardId = deposit?.card_id?._id || null;
    
        // 선택된 카드의 거래 내역 가져오기
        const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${cardId}`);
        const cardTransactions = transactionsResponse.data;
    
        // 거래 내역이 없으면 입금 금액을 10만원으로 설정
        if (cardTransactions.length === 0) {
            setSelectedDeposit((prev) => ({
                ...prev,
                transaction_amount: 100000, // 10만원 자동 설정
            }));
        } else {
            setSelectedDeposit(deposit);
        }
    
        // 상태 업데이트
        setSelectedUser(memberId);
        setSelectedCard(cardId);
        setIsEditing(true);
        setIsOpen(true);
    
        // deposit_type 값을 가져와서 초기 상태에 설정
        setDepositType(deposit.deposit_type || "RegularDeposit");
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    return (
        <>
            <AdminHader />
            <div className="flex-1 w-full p-4 sm:p-6 dark:bg-gray-800">
                    <div className="flex items-center justify-between mt-2 mb-4 px-3">
                        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">입출금 거래내역</h5>
                        <button
                            type="button"
                            className="text-black font-semibold rounded-lg text-2xl dark:text-white"
                            onClick={handleAddDeposit}
                        >
                            <IoAddCircleOutline />
                        </button>
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
                                                <div className="inline-flex gap-x-3 items-center text-base font-semibold text-gray-900 dark:text-white">
                                                    <span>
                                                        {deposit.transaction_amount.toLocaleString()}원
                                                    </span>
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
                            value={isEditing ? selectedDeposit?.card_id?.member_id : selectedUser || ""}  // selectedUser 상태로 설정
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
                            disabled={!selectedUser}
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
                                        value="RegularDeposit" // "정기 입금"을 실제 코드에 맞게 변경
                                        className="hidden peer"
                                        checked={depositType === 'RegularDeposit'}
                                        onChange={handleDepositTypeChange}
                                        disabled={!selectedCard}
                                        required
                                    />
                                    <label
                                        htmlFor="deposit_type_a"
                                        className={`${!selectedCard ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100`}
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
                                { (selectUserPosition === '팀장' || selectUserPosition === '파트장') && (
                                    <li>
                                        <input
                                            type="radio"
                                            id="deposit_type_c"
                                            name="deposit_type"
                                            value="TeamFund" // "팀운영비"
                                            className="hidden peer"
                                            checked={depositType === 'TeamFund'}
                                            onChange={handleDepositTypeChange}
                                            disabled={!selectedCard}
                                        />
                                        <label
                                            htmlFor="deposit_type_c"
                                            className={`${!selectedCard ? 'dark:border-slate-900 dark:text-slate-600 dark:bg-slate-900' : 'dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'} inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300  dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100`}
                                        >
                                            <div className="block">
                                                <div className="w-full text-md font-semibold">팀운영비</div>
                                                <div className="w-full text-sm">팀원당 3만원</div>
                                            </div>
                                            {depositType === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                        </label>
                                    </li>
                                ) }
                            </ul>
                        </div>

                        {/* 입금 금액 입력 */}
                        <div>
                            {/* {depositType !== "RegularDeposit" && ( */}
                                <InputField
                                    label="입금 금액"
                                    type="number"
                                    id="transaction_amount"
                                    value={selectedDeposit.transaction_amount || 0 } // 자동 계산된 금액
                                    className={"bg-white border border-slate-200"}
                                    onChange={(e) => setSelectedDeposit(prev => ({
                                        ...prev,
                                        transaction_amount: Number(e.target.value)
                                    }))}
                                    placeholder="입금 금액 입력"
                                    required={true}
                                    disabled={!depositType}
                                />
                            {/* )} */}
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
            </div>
        </>
    );
};

export default AdminDeposit;
