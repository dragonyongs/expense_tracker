import React, { useState, useEffect } from 'react';
import axios from "../services/axiosInstance";
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";

const TRANSACTION_URL = '/api/transactions';
const DEPOSITS_URL = '/api/transactions/deposits';
const MEMBERS_URL = '/api/members';
const CARDS_URL = '/api/cards';

const AdminDeposit = () => {
    const [users, setUsers] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedCard, setSelectedCard] = useState("");
    const [deposits, setDeposits] = useState([]);
    const [balance, setBalance] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState({
        transaction_amount: ""
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

    const fetchUsers = async () => {
        try {
            const response = await axios.get(MEMBERS_URL);
            setUsers(response.data);
        } catch (error) {
            setErrMsg("사용자 목록을 불러오지 못했습니다.");
        }
    };

    const fetchDeposits = async () => {
        try {
            const response = await axios.get(DEPOSITS_URL);
            setDeposits(response.data);
        } catch (error) {
            setErrMsg("입금 내역을 불러오지 못했습니다.");
        }
    };

    // 사용자 리스트 불러오기
    useEffect(() => {
        fetchDeposits();
        fetchUsers();
    }, []);


    const handleAddDeposit = () => {
        setSelectedDeposit({
            transaction_amount: ""
        });
        setIsEditing(false); 
        setIsOpen(true);
    };

    // 사용자 선택 핸들러
    const handleUserChange = async (e) => {
        const selectedUserId = e.target.value;
        setSelectedUser(selectedUserId); // 사용자 선택

        try {
            // 선택한 사용자의 ID로 카드 목록 필터링
            const response = await axios.get(`${CARDS_URL}/member/${selectedUserId}`);
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
                    card_id: '',
                }));
            }
        } catch (error) {
            setErrMsg("카드 목록을 불러오지 못했습니다.");
        }
    };
        
    // 카드 선택 핸들러
    const handleCardChange = (e) => {
        const selectedCardId = e.target.value;
        const selectedCardInfo = cards.find(card => card._id === selectedCardId); // 선택한 카드 정보 찾기

        if (selectedCardInfo) {
            setBalance(selectedCardInfo.balance); // 카드의 잔액 설정
            setSelectedCard(selectedCardId); // 선택된 카드 업데이트
        }

        setSelectedDeposit((prev) => ({
            ...prev,
            card_id: selectedCardId, // 선택된 카드 ID 업데이트
        }));
    };

    // 상태 변화 확인용 useEffect
    useEffect(() => {
        console.log('selectedDeposit:', selectedDeposit);
    }, [selectedDeposit]);

    // 입금 저장 처리
    const handleSave = async () => {
        try {
            setErrMsg('');

            const transactionData = {
                card_id: selectedCard,
                transaction_amount: selectedDeposit.transaction_amount,
                merchant_name: '관리자',
                menu_name: '잔액 충전',
                transaction_type: '입금',
                transaction_date: new Date().toISOString().split('T')[0],
            };
            
            console.log('transactionData: ', transactionData);

            // 트랜잭션 저장 (입금 처리)
            const response = await axios.post(TRANSACTION_URL, transactionData);
            console.log("입금 성공:", response.data);

            // 입금 후 카드 balance 업데이트 (기존 balance에 transaction_amount 더하기)
            const updatedBalance = parseFloat(balance) + parseFloat(selectedDeposit.transaction_amount);

            // 카드 balance 업데이트 API 호출
            await axios.put(`${CARDS_URL}/${selectedCard}`, { balance: updatedBalance });

            console.log("카드 잔액 업데이트 성공:", updatedBalance);

            // 상태 값 업데이트
            setBalance(updatedBalance);
            fetchDeposits();
            handleCloseDrawer();
        } catch (error) {
            console.error('입금 처리 중 오류:', error);
            setErrMsg("입금 처리 중 오류가 발생했습니다.");
        }
    };


    const handleOpenDrawer = (deposit) => {
        setSelectedDeposit(deposit);
        setIsEditing(true);
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div className="w-full p-4 sm:p-6 dark:bg-gray-800">
                <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-bold leading-none text-gray-900 dark:text-white">입출금 거래내역</h5>
                        <button
                            type="button"
                            className="text-black font-semibold rounded-lg text-2xl"
                            onClick={handleAddDeposit}
                        >
                            <IoAddCircleOutline />
                        </button>
                    </div>

                    <div className="flow-root">
                        {deposits.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                데이터가 없습니다.
                            </div>
                        ) : (
                            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                {deposits.map(deposit => (
                                    <li key={deposit._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(deposit)}>
                                        <div className="flex items-center py-2">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-full border bg-white overflow-hidden flex items-center justify-center">
                                                        <span className="text-slate-500 text-lg font-normal">
                                                            {deposit.merchant_name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 ms-4">
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
                                    // onClick={handleDelete}
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
                        {errMsg && <div className="text-red-600">{errMsg}</div>}

                        {/* 사용자 선택 */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="member_id">사용자 선택</label>
                            <select
                                id="member_id"
                                name="member_id"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                value={selectedDeposit.member_id || ""}
                                onChange={handleUserChange}
                            >
                                <option value="">사용자 선택</option>
                                {users.map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.member_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 카드 선택 */}
                        {isEditing ? (""
                        ) : (
                            
                        <select
                            id="card_id"
                            name="card_id"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            value={selectedDeposit.card_id || ""}
                            onChange={handleCardChange}
                        >
                            <option value="">카드 선택</option>
                            {cards.map((card) => (
                                <option key={card._id} value={card._id}>
                                    {card.card_number}/ {card.balance}
                                </option>
                            ))}
                        </select>
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
