import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import { API_URLS } from '../services/apiUrls';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline, IoCheckmark } from "react-icons/io5";

// import { MdKeyboardArrowRight } from "react-icons/md";

const AdminDeposit = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCard, setSelectedCard] = useState("");
    const [deposits, setDeposits] = useState([]);
    const [balance, setBalance] = useState('');
    const [depositType, setDepositType] = useState("");
    const [selectedDeposit, setSelectedDeposit] = useState({
        _id: "", // 초기값을 빈 문자열로 설정
        member_name: "",
        card_id: "", // 필요시 추가
        merchant_name: "",
        menu_name: "",
        transaction_date: "",
        transaction_amount: "", 
        transaction_type: "",
        deposit_type: "RegularDeposit", // 기본값 설정,

    });
    
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    // useEffect(() => {
    //     console.log('selectedDeposit has been updated: ', selectedDeposit);
    // }, [selectedDeposit]);
    

    const fetchAuccountData = async (url) => {
        try {
            const response = await axios.get(url, { withCredentials: true });
            setAccounts(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCardData = async (url) => {
        try {
            const response = await axios.get(url, { withCredentials: true });
            setCards(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuccountData(`${API_URLS.ACCOUNTS_WITH_CARDS}`);
        fetchCardData(`${API_URLS.CARDS}`);
    }, []);


    // 팀원 수 계산 함수
    const calculateTeamMembersCount = () => {
        return accounts.reduce((count, account) => {
            return count + account.cards.length; // 팀장 포함하여 모든 카드 수
        }, 0);
    };

    // 팀운영비 자동 계산
    const calculateTeamFund = () => {
        const teamMembersCount = calculateTeamMembersCount();
        return 30000 * teamMembersCount; // 팀 운영비 = 3만원 * 팀원 수
    };

    useEffect(() => {
        if (depositType !== "TeamFund") {
            console.log('초기화');
            setSelectedDeposit(prevDeposit => ({
                ...prevDeposit, // 이전 상태를 가져옴
                transaction_amount: '' // transaction_amount만 초기화
            }));
        } else {
            setSelectedDeposit(prevDeposit => ({
                ...prevDeposit, // 이전 상태를 가져옴
                transaction_amount: calculateTeamFund() // 팀 운영비일 경우 자동 계산된 값 설정
            }));
        }
    }, [depositType]);
    
    const teamMembersCount = calculateTeamMembersCount(); // 팀원 수 계산

    const handleDepositTypeChange = (e) => {
        const selectedType = e.target.value;
        console.log('selectedType', selectedType);
        setDepositType(selectedType);
        
        // Reset transaction amount based on the selected type
        setSelectedDeposit({ ...selectedDeposit, transaction_amount: selectedType === "AdditionalDeposit" ? "" : selectedDeposit.transaction_amount });
    };

    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    const handleDelete = async () => {
        try {
            console.log('handleDelete: ', selectedDeposit);
            // 선택된 입금 내역의 금액과 카드 정보 조회
            const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
            console.log('response', response);
            const depositData = response.data;
            const depositDate = new Date(depositData.transaction_date); // 입금된 날짜
            const depositAmount = parseFloat(depositData.transaction_amount);
    
            // 해당 입금 내역의 카드 정보 조회
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${depositData.card_id}`);
            const cardData = cardResponse.data;
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
            let isTeamFund = depositData.deposit_type === 'TeamFund'; // 팀 운영비 여부 체크
    
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
                let updatedTeamFund = parseFloat(cardData.team_fund);
                updatedTeamFund = Math.max(updatedTeamFund - depositAmount, 0); // 음수가 되지 않도록 보장
    
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
            fetchDeposits();
            
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

    const fetchDeposits = async () => {
        try {
            const response = await axios.get(API_URLS.DEPOSITS);
            const sortedDeposits = response.data
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

            setDeposits(sortedDeposits);
        } catch (error) {
            setErrMsg("입금 내역을 불러오지 못했습니다.");
        }
    };

    // 사용자 리스트 불러오기
    useEffect(() => {
        fetchDeposits();
        fetchFilteredMembers();
    }, [isOpen, isDeleteConfirmOpen]); // Drawer가 열리거나 삭제 모달이 열릴 때만 호출
    
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

            if (userCards.length > 0) {
                setCards(userCards); // 카드 목록 업데이트
                setSelectedCard(userCards[0]._id); // 첫 번째 카드를 자동으로 선택
                setBalance(userCards[0].balance); // 카드 잔액 설정
    
                // 선택된 사용자 및 카드 정보 업데이트
                setSelectedDeposit((prev) => ({
                    ...prev,
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
        const selectedCardId = e.target.value;
        const selectedCardInfo = cards.find(card => card._id === selectedCardId);
    
        if (selectedCardInfo) {
            setBalance(selectedCardInfo.balance);
            setSelectedCard(selectedCardId);
    
            // 선택된 카드 정보 업데이트
            setSelectedDeposit((prev) => ({
                ...prev,
                card_id: selectedCardId,
            }));
        }
    };

    // 입금 저장 처리
    const handleSave = async () => {
        try {
            setErrMsg('');
    
            // 카드의 현재 잔액 및 rollover_amount 가져오기
            if (!selectedCard) throw new Error("선택된 카드가 없습니다.");
    
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${selectedCard}`);
            const cardData = cardResponse.data;

            let isTeamFund = selectedDeposit.deposit_type === 'TeamFund'; // 팀 운영비 여부 체크
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
            let teamFund = parseFloat(cardData.team_fund); // 팀 운영비
            const depositAmount = parseFloat(selectedDeposit.transaction_amount);
    
            if (depositAmount <= 0) throw new Error("입금 금액은 0보다 커야 합니다.");
    
            if (isEditing) {
                // 수정 모드일 때 기존 입금 내역을 불러옴
                const existingDepositResponse = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
                const existingDeposit = existingDepositResponse.data;
                const previousAmount = parseFloat(existingDeposit.transaction_amount);
            
                // 수정하려는 입금 내역의 날짜
                const depositDate = new Date(existingDeposit.transaction_date);

                // 해당 카드의 모든 트랜잭션 조회
                const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${selectedCard}`);
                const transactions = transactionsResponse.data;

                // 입금 이후에 발생한 거래가 있는지 확인
                const hasPostDepositTransactions = transactions.some(transaction => {
                    const transactionDate = new Date(transaction.transaction_date);
                    return transactionDate > depositDate && transaction.transaction_type === 'expense';
                });

                if (hasPostDepositTransactions) {
                    // 입금 이후에 발생한 거래가 있으면 수정 방지
                    setErrMsg("이 입금 이후에 사용된 내역이 있어 수정할 수 없습니다.");
                    console.warn('입금 이후 사용 내역이 있어 수정이 불가능합니다.');
                    return;
                }

                // 수정된 금액과 기존 금액의 차액을 계산
                const difference = depositAmount - previousAmount;
                console.log(depositAmount, '-', previousAmount, '=', difference );

                // 차액을 잔액에 반영
                // if (updatedBalance + difference > 100000) {
                //     const excess = updatedBalance + difference - 100000;
                //     rolloverAmount += excess;
                //     updatedBalance = 100000;  // 잔액은 100,000원을 초과하지 않도록 유지
                // } else if (updatedBalance + difference < 0) {
                //     // 차액으로 인해 잔액이 0보다 작아지는 경우
                //     throw new Error("잔액이 부족하여 트랜잭션을 수정할 수 없습니다.");
                // } else {
                //     // 차액을 잔액에 반영
                //     updatedBalance += difference;
                // }

                if (isTeamFund) {
                    // 팀 운영비일 경우 team_fund에서 차액을 처리
                    if (teamFund + difference < 0) {
                        throw new Error("팀 운영비가 부족하여 트랜잭션을 수정할 수 없습니다.");
                    }
                    teamFund += difference;
                } else {
                    // 일반 카드 잔액에서 차액 처리
                    if (updatedBalance + difference > 100000) {
                        const excess = updatedBalance + difference - 100000;
                        rolloverAmount += excess;
                        updatedBalance = 100000;  // 잔액은 100,000원을 초과하지 않도록 유지
                    } else if (updatedBalance + difference < 0) {
                        throw new Error("잔액이 부족하여 트랜잭션을 수정할 수 없습니다.");
                    } else {
                        updatedBalance += difference;
                    }
                }
            
                // 트랜잭션 업데이트
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`, {
                    card_id: selectedCard,
                    transaction_amount: depositAmount,
                    merchant_name: '관리자',
                    menu_name: selectedDeposit?.menu_name || "월 잔액 충전",
                    transaction_type: 'income',
                    transaction_date: selectedDeposit?.transaction_date,
                    deposit_type: depositType,
                    team_fund: teamFund,
                });
            } else {
                // 새로운 입금일 경우
                if (depositType === 'RegularDeposit') {
                    // 정기 입금일 경우 기존 잔액과 이월 금액을 고려
                    if (updatedBalance < 10000) {
                        // 잔액이 1만원 미만일 경우 이전 잔액을 이월 잔액으로 설정
                        rolloverAmount += updatedBalance; // 이전 잔액을 이월 잔액으로 설정
                        updatedBalance = 100000; // 잔액을 10만원으로 설정
                    } else {
                        // 잔액이 1만원 이상일 경우 차액만 입금
                        const excessAmount = Math.max(0, 100000 - updatedBalance);
                        updatedBalance += excessAmount;
                    }
                } else if (depositType === 'AdditionalDeposit') {
                    // 추가 입금일 경우
                    updatedBalance += depositAmount; // 잔액에 추가 금액을 더함
                    // 이월 잔액에는 포함되지 않음
                }
    
                // 새로운 트랜잭션 저장
                await axios.post(API_URLS.TRANSACTIONS, {
                    card_id: selectedCard,
                    transaction_amount: depositAmount,
                    merchant_name: '관리자',
                    menu_name: selectedDeposit?.menu_name || "월 잔액 충전",
                    transaction_type: 'income',
                    deposit_type: depositType,
                    transaction_date: new Date(),
                });
            }
            
            // 카드의 balance와 rollover_amount 업데이트 API 호출
            await axios.put(`${API_URLS.CARDS}/${selectedCard}`, {
                balance: updatedBalance,
                rollover_amount: rolloverAmount,
                team_fund: teamFund,
            });
    
            console.log("카드 잔액 및 rollover_amount 업데이트 성공:", updatedBalance, rolloverAmount, teamFund);
            
            // 상태 값 업데이트 및 모달 닫기
            setBalance(updatedBalance);
            fetchDeposits();
            handleCloseDrawer();
        } catch (error) {
            console.error('입금 처리 중 오류:', error);
            const message = error.response?.data?.message || error.message;
            setErrMsg(message);
        }
    };
    
    // 드로어 열 때 카드 정보 업데이트
    const handleOpenDrawer = (deposit) => {
        const memberId = deposit?.card_id?.member_id || null;
        const cardId = deposit?.card_id?._id || null;

        // 상태  업데이트
        setSelectedDeposit(deposit);
        setSelectedUser(memberId);
        setSelectedCard(cardId);
        setIsEditing(true);
        setIsOpen(true);

        // deposit_type 값을 가져와서 초기 상태에 설정
        setDepositType(deposit.deposit_type || "RegularDeposit"); // 기본값을 "정기 입금"으로 설정
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    return (
        <>
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
                            required
                        />

                        <div>
                            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">입금 형식</h3>
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
                                        required
                                    />
                                    <label
                                        htmlFor="deposit_type_a"
                                        className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                                    />
                                    <label
                                        htmlFor="deposit_type_b"
                                        className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">여비교통비</div>
                                            <div className="w-full text-sm">금액입력</div>
                                        </div>
                                        {depositType === 'TransportationExpense' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                                <li>
                                    <input
                                        type="radio"
                                        id="deposit_type_c"
                                        name="deposit_type"
                                        value="TeamFund" // "팀운영비"
                                        className="hidden peer"
                                        checked={depositType === 'TeamFund'}
                                        onChange={handleDepositTypeChange}
                                    />
                                    <label
                                        htmlFor="deposit_type_c"
                                        className="inline-flex items-center justify-between w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
                                    >
                                        <div className="block">
                                            <div className="w-full text-md font-semibold">팀운영비</div>
                                            <div className="w-full text-sm">팀원당 3만원</div>
                                        </div>
                                        {depositType === 'TeamFund' && <IoCheckmark className="w-6 h-6" />}
                                    </label>
                                </li>
                            </ul>
                        </div>

                        {/* 입금 금액 입력 */}
                        <div>
                            {depositType !== "RegularDeposit" && (
                                <InputField
                                    label="입금 금액"
                                    id="transaction_amount"
                                    value={selectedDeposit.transaction_amount || ''} // 자동 계산된 금액
                                    className={"bg-white border border-slate-200"}
                                    onChange={(e) => setSelectedDeposit({ ...selectedDeposit, transaction_amount: e.target.value })}
                                    placeholder="입금 금액 입력"
                                    required={true}
                                />
                            )}
                            {depositType === "TeamFund" && (
                                <div className="mt-2 text-gray-500">
                                    <span>팀 인원: {teamMembersCount}명</span> {/* 팀원 수만 표시 */}
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
                        />

                        <InputField 
                            label="거래일" 
                            id="transaction_date" 
                            type='date'
                            value={selectedDeposit?.transaction_date?.split("T")[0] || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit({ ...selectedDeposit, transaction_date: e.target.value })}
                            placeholder=""
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
