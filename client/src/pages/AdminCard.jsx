import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";

const ACCOUNT_URL = '/api/accounts';
const MEMBER_URL = '/api/members';
const CARD_URL = '/api/cards';

const AdminCard = () => {
    const [cards, setCards] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [members, setMembers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const fetchCards = async () => {
        try {
            const response = await axios.get(CARD_URL);
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(ACCOUNT_URL);
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    const fetchMembers = async () => {
        try {
            const response = await axios.get(MEMBER_URL);
            setMembers(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    useEffect(() => {
        fetchCards();
        fetchMembers();
        fetchAccounts();
    }, []);

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleAddCard = () => {
        setSelectedCard({ 
            card_number: '',
            limit: '',
            account_id: '',
            member_id: ''
        });
        setIsEditing(false);
        setIsOpen(true);
    };

    // 수정 모드로 모달 열기
    const handleOpenDrawer = (cards) => {
        setSelectedCard(cards);
        setIsEditing(true); // 수정 모드로 설정
        setIsOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsOpen(false);
        setSelectedCard(null);
    };

    const handleSave = async () => {
        try {
            const cardData = {
                ...selectedCard,
            };

            if (isEditing) {
                // 수정 모드일 때 PUT 요청
                await axios.put(`${CARD_URL}/${selectedCard._id}`, cardData);
                console.log("Card updated successfully:", cardData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(CARD_URL, cardData);
                console.log("Card added successfully:", cardData);
            }
            
            await fetchCards();
            
            handleCloseDrawer();
        } catch (error) {
            console.error("Error updating Cards:", error);
        }
    };

    const handleDeleteConfirm = () => {
        setIsDeleteConfirmOpen(true);
    };
    
    const handleDeleteCancel = () => {
        setIsDeleteConfirmOpen(false);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${CARD_URL}/${selectedCard._id}`);
            console.log("Card deleted successfully", selectedCard.card_number);
            await fetchCards();
            handleCloseDrawer();
        } catch (error) {
            console.error("Error deleting card:", error);
        } finally {
            setIsDeleteConfirmOpen(false);
        }
    };
    

    const handleAccountChange = (e) => {
        const selectedAccountId = e.target.value;
        const selectedAccount = accounts.find(account => account._id === selectedAccountId);

        if (!selectedAccount) {
            console.error('선택된 계좌를 찾을 수 없습니다.');
            return;
        }
    
        setSelectedCard({
            ...selectedCard,
            account_id: {
                _id: selectedAccount._id,
                account_number: selectedAccount.account_number
            }
        });
    };

    const handleMemberChange = (e) => {
        const selectedMemberId = e.target.value;
        const selectedMember = members.find(member => member._id === selectedMemberId);

        if (!selectedMember) {
            console.error('선택된 사용자를 찾을 수 없습니다.');
            return;
        }

        setSelectedCard({
            ...selectedCard,
            member_id: {
                _id: selectedMember._id,
                member_name: selectedMember.member_name
            }
        });
    };

    return (
        <>
            <div className='w-full mt-4 p-4 sm:p-8 dark:bg-gray-800'>
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">카드 목록</h5>
                    <button
                        type="button" 
                        className='text-black font-semibold rounded-lg text-2xl'
                        onClick={handleAddCard}
                    ><IoAddCircleOutline /></button>
                </div>
                <div className='flow-root'>
                    {cards.length === 0 ? (
                        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                            데이터가 없습니다.
                        </div>
                    ) : (
                        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cards.map(card => (
                                <li key={card._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(card)}>
                                    <div className="flex items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                {card.card_number}<span className='inline-block border border-slate-300 ml-3 px-2 py-1 rounded-md'>{card.member_id.member_name}</span>
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            <MdKeyboardArrowRight className='text-2xl' />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
            </div>

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

            <CommonDrawer isOpen={isOpen} onClose={toggleDrawer} title={isEditing ? '카드 수정' : '카드 추가'}>
                {selectedCard && (
                    <form>
                        <div className="flex w-full flex-col gap-6 overflow-y-auto h-drawer-screen p-6">
                            <InputField 
                                label="카드 번호" 
                                id="card_number" 
                                value={selectedCard.card_number}
                                onChange={(e) => setSelectedCard({ ...selectedCard, card_number: e.target.value })}
                                placeholder="카드 입력"
                                required
                            />

                            <InputField 
                                label="최초 한도" 
                                id="initial_limit"
                                type="number"
                                value={selectedCard.limit || 0}
                                onChange={(e) => setSelectedCard({ ...selectedCard, limit: e.target.value })}
                                placeholder="한도 입력"
                            />

                            <InputField 
                                label="현재 잔액" 
                                id="balance"
                                type="number"
                                value={selectedCard.balance || 0}
                                placeholder=""
                                disabled={true}
                                required
                            />

                            <div className="flex flex-col gap-2">
                                <label htmlFor="members_id">사용자</label>
                                <select
                                    id="members_id"
                                    name="members_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedCard?.member_id?._id || ""}  // 현재 상태의 _id 값 설정
                                    onChange={handleMemberChange}
                                >
                                    <option value="" disabled>사용자 선택</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.member_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2 pb-2">
                                <label htmlFor="account_id">연결 걔좌</label>
                                <select
                                    id="account_id"
                                    name="account_id"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                    value={selectedCard?.account_id?._id || ""}  // 현재 상태의 _id 값 설정
                                    onChange={handleAccountChange}
                                >
                                    <option value="" disabled>연결 계좌 선택</option>
                                    {accounts.map(account => (
                                        <option key={account._id} value={account._id}>
                                            {account.account_number}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                    </form>
                )}
            </CommonDrawer>

        </>
    )
}

export default AdminCard;