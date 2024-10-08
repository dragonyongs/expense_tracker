import React, { useEffect, useState } from 'react'
import axios from "../services/axiosInstance"; 
import { API_URLS } from '../services/apiUrls';
import CommonDrawer from '../components/CommonDrawer';
import InputField from '../components/InputField';
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import SelectField from '../components/SelectField';
import AdminHader from '../components/AdminHader';

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
            const response = await axios.get(API_URLS.CARDS);
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(API_URLS.ACCOUNTS);
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    }

    const fetchMembers = async () => {
        try {
            const response = await axios.get(API_URLS.MEMBERS);
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
                await axios.put(`${API_URLS.CARDS}/${selectedCard._id}`, cardData);
                console.log("Card updated successfully:", cardData);
            } else {
                // 추가 모드일 때 POST 요청
                await axios.post(API_URLS.CARDS, cardData);
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
            await axios.delete(`${API_URLS.CARDS}/${selectedCard._id}`);
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
            <AdminHader />
            <div className="flex-1 w-full p-4 sm:p-6 dark:bg-gray-800">
                <div className="flex items-center justify-between mt-2 mb-4 px-3">
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">카드 목록</h5>
                    <button
                        type="button"
                        className="text-black font-semibold rounded-lg text-2xl dark:text-white"
                    onClick={handleAddCard}
                ><IoAddCircleOutline /></button>
                </div>

                <div className='flow-root'>
                    <div className='space-y-4 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-700'>
                        {cards.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                                데이터가 없습니다.
                            </div>
                        ) : (
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {cards.map(card => {
                                        const totalBalance = card.balance + (card.rollover_amount || 0); // 이월 금액을 합산
                                        return (
                                            <li key={card._id} className='py-3 sm:py-4 cursor-pointer' onClick={() => handleOpenDrawer(card)}>
                                                <div className="flex items-center">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-md font-medium text-gray-900 truncate dark:text-white">
                                                            {card.card_number}
                                                        </p>
                                                        <p className='inline-block dark:text-white'>{card.member_id.member_name}</p>
                                                    </div>
                                                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                        <span className='font-bold tracking-tight'>{totalBalance.toLocaleString()}</span>원
                                                        <MdKeyboardArrowRight className='text-2xl' />
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}

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
                                    value={(selectedCard.balance + (selectedCard.rollover_amount || 0)) || 0}  // 이월 금액을 합산
                                    placeholder=""
                                    disabled={true}
                                    required
                                />

                                <InputField 
                                    label="팀 운영비 잔액" 
                                    id="team_fund"
                                    type="number"
                                    value={selectedCard.team_fund || 0}
                                    placeholder=""
                                    disabled={true}
                                />

                                <SelectField
                                    label="사용자"
                                    id="card_id"
                                    value={selectedCard?.member_id?._id || ""}
                                    onChange={handleMemberChange}
                                    options={members.map(member => ({ value: member._id, label: member.member_name}
                                    ))}
                                    placeholder="사용자 선택"
                                    required
                                />

                                <SelectField
                                    label="연결 계좌"
                                    id="account_id"
                                    value={selectedCard?.account_id?._id || ""}
                                    onChange={handleAccountChange}
                                    options={accounts.map(account => ({ value: account._id, label: account.account_number}
                                    ))}
                                    placeholder="연결 계좌"
                                    required
                                />

                            </div>
                            {/* 저장 버튼 */}
                            <div className="flex flex-col gap-3 pt-4 p-6">
                                <div className='flex justify-between gap-y-4 gap-x-2'>
                                    {!isEditing ? '' : <button
                                        type="button" 
                                        className='text-red-600 font-semibold text-sm border border-red-400 px-5 py-3 rounded-lg dark:text-orange-50 dark:border-none dark:bg-orange-600'
                                        onClick={handleDeleteConfirm}
                                    >삭제</button>
                                    }
                                    <button type="button" onClick={handleSave} className="flex-1 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-3 dark:bg-blue-600 dark:hover:bg-blue-700">
                                        {isEditing ? '수정' : '추가'}
                                    </button>
                                </div>
                                <button type="button" onClick={handleCloseDrawer} className="w-full text-slate-600 dark:text-slate-400">
                                    취소
                                </button>
                            </div>
                        </form>
                    )}
                </CommonDrawer>
            </div>
        </>
    )
}

export default AdminCard;