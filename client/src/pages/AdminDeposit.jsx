import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import { API_URLS } from '../services/apiUrls';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { IoAddCircleOutline } from "react-icons/io5";
// import { MdKeyboardArrowRight } from "react-icons/md";

const AdminDeposit = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCard, setSelectedCard] = useState("");
    const [deposits, setDeposits] = useState([]);
    const [balance, setBalance] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState({
        transaction_amount: "",
        member_id: null, 
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
                .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
            const cardResponse = await axios.get(`${API_URLS.CARDS}/${selectedCard}`);
            const cardData = cardResponse.data;
            let updatedBalance = parseFloat(cardData.balance);
            let rolloverAmount = parseFloat(cardData.rollover_amount);
    
            const depositAmount = parseFloat(selectedDeposit.transaction_amount);
    
            if (isEditing) {
                // 수정 모드일 때 기존 입금 내역을 불러옴
                const existingDepositResponse = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
                const existingDeposit = existingDepositResponse.data;
                const previousAmount = parseFloat(existingDeposit.transaction_amount);
    
                // 기존 금액을 다시 더해 현재 잔액을 복원
                if (updatedBalance + previousAmount > 100000) {
                    const excess = updatedBalance + previousAmount - 100000;
                    rolloverAmount -= excess;
                    updatedBalance = 100000;
                } else {
                    updatedBalance += previousAmount;
                }
    
                // 수정된 금액을 적용한 후 다시 잔액 계산
                if (updatedBalance + depositAmount > 100000) {
                    const excessAmount = updatedBalance + depositAmount - 100000;
                    rolloverAmount += excessAmount;
                    updatedBalance = 100000;
                } else {
                    updatedBalance += depositAmount;
                }
    
                // 트랜잭션 업데이트
                await axios.put(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`, {
                    card_id: selectedCard,
                    transaction_amount: selectedDeposit.transaction_amount,
                    merchant_name: '관리자',
                    menu_name: selectedDeposit?.menu_name || "월 잔액 충전",
                    transaction_type: '입금',
                    transaction_date: new Date().toISOString().split('T')[0],
                });
            } else {
                // 새로운 입금일 경우
                if (updatedBalance + depositAmount > 100000) {
                    const excessAmount = updatedBalance + depositAmount - 100000;
                    rolloverAmount += excessAmount;
                    updatedBalance = 100000;
                } else {
                    updatedBalance += depositAmount;
                }
    
                // 새로운 트랜잭션 저장
                await axios.post(API_URLS.TRANSACTIONS, {
                    card_id: selectedCard,
                    transaction_amount: selectedDeposit.transaction_amount,
                    merchant_name: '관리자',
                    menu_name: selectedDeposit?.menu_name || "월 잔액 충전",
                    transaction_type: '입금',
                    transaction_date: new Date().toISOString().split('T')[0],
                });
            }
    
            // 카드의 balance와 rollover_amount 업데이트 API 호출
            await axios.put(`${API_URLS.CARDS}/${selectedCard}`, {
                balance: updatedBalance,
                rollover_amount: rolloverAmount,
            });
    
            console.log("카드 잔액 및 rollover_amount 업데이트 성공:", updatedBalance, rolloverAmount);
    
            // 상태 값 업데이트 및 모달 닫기
            setBalance(updatedBalance);
            fetchDeposits();
            handleCloseDrawer();
        } catch (error) {
            console.error('입금 처리 중 오류:', error);
            setErrMsg("입금 처리 중 오류가 발생했습니다.");
        }
    };
    
    // 드로어 열 때 카드 정보 업데이트
    const handleOpenDrawer = (deposit) => {
        setSelectedDeposit({
            ...deposit,
            member_id: deposit.member_id || '', // 기본값 설정
            card_id: deposit.card_id || '', // 기본값 설정
        });
        setIsEditing(true);
        setIsOpen(true);
    };

    // 드로어에서 사용자 선택 값 설정
    useEffect(() => {
        if (selectedDeposit && selectedDeposit.member_id && !selectedUser) {
            // 사용자가 선택된 경우 카드 목록을 업데이트, selectedUser가 이미 설정되어 있으면 handleUserChange 호출 안함
            handleUserChange({ target: { value: selectedDeposit.member_id } });
        }
    }, [selectedDeposit, selectedUser]); // selectedUser를 의존성에 추가

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
                            value={selectedUser || ""}  // selectedUser 상태로 설정
                            onChange={handleUserChange}
                            options={users.map(member => ({
                                value: member._id,
                                label: member.member_name
                            }))}
                            placeholder="사용자 선택"
                            required
                        />

                        {/* 카드 선택 */}
                        {isEditing ? (""
                        ) : (
                            <SelectField
                                label="카드"
                                id="card_id"
                                value={selectedDeposit?.card_id || ""}
                                onChange={handleCardChange}
                                options={cards.map(card => ({ value: card._id, label: card.card_number}
                                ))}
                                placeholder="카드 선택"
                                required
                            />
                        )}

                        {/* 입금 금액 입력 */}
                        <InputField
                            label="입금 금액"
                            id="transaction_amount"
                            value={selectedDeposit?.transaction_amount || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit({ ...selectedDeposit, transaction_amount: e.target.value })}
                            placeholder="입금 금액 입력"
                            required={true}
                        />

                        <InputField
                            label="입금명"
                            id="menu_name"
                            value={selectedDeposit?.menu_name || ""}
                            className={"bg-white border border-slate-200"}
                            onChange={(e) => setSelectedDeposit({ ...selectedDeposit, menu_name: e.target.value })}
                            placeholder="입급명 입력"
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
