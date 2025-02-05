import { useState, useEffect } from "react";
import axios from "../services/axiosInstance";
import calculateUniqueTeamMembersCount from '../utils/teamUtils';

const useDepositManagement = (API_URLS) => {
    const initialDeposit = {
        _id: "",
        member_name: "",
        card_id: "",
        merchant_name: "",
        menu_items: [],
        transaction_date: "",
        transaction_amount: "",
        transaction_type: "",
        is_deducted: false,
    };

    const [state, setState] = useState({
        users: [],
        cards: [],
        accounts: [],
        deposits: [],
        selectedCardId: "",
        selectedUserId: "",
        selectedUser: {},
        selectedDeposit: initialDeposit,
        selectUserPosition: "",
        loading: true,
        isDeleteConfirmOpen: false,
        isEditing: false,
        isOpen: false,
        isDeductedOpen: false,
        errMsg: "",
    });

    const [currentMenuItem, setCurrentMenuItem] = useState({
        deposit_type: "",
        name: "",
        price: 0,
        quantity: 1,
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

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

    const fetchData = async (url, key) => {
        setState(prev => ({ ...prev, loading: true }));
        try {
        const response = await axios.get(url, { withCredentials: true });
        let data = response.data;
        if (key === "deposits") {
            data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
            return depositDate.getMonth() + 1 === currentMonth && depositDate.getFullYear() === currentYear;
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

    const handleDeleteConfirm = () => setState(prev => ({ ...prev, isDeleteConfirmOpen: true }));

    const handleDeleteCancel = () => setState(prev => ({ ...prev, isDeleteConfirmOpen: false }));

    const handleOpenDrawer = async (deposit) => {
        try {
        const memberId = deposit?.card_id?.member_id || null;
        const cardId = deposit?.card_id?._id || null;
        const response = await axios.get(`${API_URLS.CARDS}/member/${memberId}`);
        const userCards = response.data;
        const userPosition = userCards.find(card => card.member_id._id === memberId)?.member_id?.position || "";
        setState(prev => ({
            ...prev,
            selectUserPosition: userPosition,
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

    const handleCloseDrawer = () => setState(prev => ({
        ...prev,
        errMsg: "",
        selectedDeposit: initialDeposit,
        isOpen: false,
        isDeductedOpen: false,
    }));

    const handleDepositTypeAdd = async (e) => {
        const selectedType = e.target.value;
        const { accounts, selectedUserId, selectedUser } = state;
    
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
    
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
    
            if (selectedType && !state.isEditing) {
                if (selectedType === "RegularDeposit") {
                    if (hasRegularDeposit) {
                        depositAmount = 0;
                    } else {
                        const usageQuota = 10000 / teamMembersCount;
                        depositAmount = cardBalance > usageQuota
                            ? Math.max(0, cardLimit - cardBalance)
                            : cardLimit;
                    }
                } else if (selectedType === "TeamFund") {
                    if (hasTeamFund) {
                        depositAmount = 0;
                    } else {
                        const isTeamLeader = state.selectUserPosition === "팀장";
                        const isPartLeader = state.selectUserPosition === "파트장";
                        depositAmount = isTeamLeader
                            ? teamMembersCount * 30000
                            : isPartLeader
                                ? 30000
                                : 0;
                    }
                } else if (selectedType === "TransportationDeposit") {
                    depositAmount = 0;
                }
            }
    
            const currentMonthName = new Date().toLocaleString("ko-KR", { month: "long" });
            const userName = selectedUser?.member_name || '';
            const teamName = selectedUser?.team_id?.team_name || "팀";
    
            const newDepositItem = {
                deposit_type: selectedType,
                name: selectedType === "RegularDeposit" 
                    ? `${userName}님 ${currentMonthName} ${teamName} 팀비`
                    : selectedType === "TeamFund"
                        ? `${currentMonthName} ${teamName} 팀운영비`
                        : `${userName}님 ${currentMonthName} 교통비`,
                price: depositAmount,
                quantity: 1
            };

            // 상태 업데이트: currentMenuItem 설정
            setCurrentMenuItem(newDepositItem);

            // setState(prevState => {
            //     const existingItemIndex = prevState.selectedDeposit.menu_items.findIndex(
            //         item => item.deposit_type === selectedType && item.name === newDepositItem.name
            //     );
    
            //     let updatedMenuItems;
            //     if (existingItemIndex !== -1) {
            //         updatedMenuItems = prevState.selectedDeposit.menu_items.map((item, index) => 
            //             index === existingItemIndex 
            //                 ? { ...item, quantity: item.quantity + 1 }
            //                 : item
            //         );
            //     } else {
            //         updatedMenuItems = [...prevState.selectedDeposit.menu_items, newDepositItem];
            //     }
    
            //     const totalAmount = updatedMenuItems.reduce((sum, item) => {
            //         return sum + (Number(item.price) * item.quantity);
            //     }, 0);
    
            //     return {
            //         ...prevState,
            //         selectedDeposit: {
            //             ...prevState.selectedDeposit,
            //             menu_items: updatedMenuItems,
            //             transaction_amount: totalAmount
            //         }
            //     };
            // });
    
        } catch (error) {
            console.error("트랜잭션 데이터 로드 실패", error);
        }
    };

    const handleAddMenuItem = () => {
        if (!currentMenuItem || !currentMenuItem.deposit_type) {
            console.error("유효한 메뉴 아이템이 없습니다.");
            return;
        } else if (currentMenuItem.price === 0) {
            console.error("금액을 입력하세요!")
            return;
        }
    
        setState(prevState => {
            const existingItemIndex = prevState.selectedDeposit.menu_items.findIndex(
                item => item.deposit_type === currentMenuItem.deposit_type &&
                        item.name === currentMenuItem.name
            );
    
            let updatedMenuItems;
            if (existingItemIndex !== -1) {
                // 이미 있는 아이템이면 수량 증가
                updatedMenuItems = prevState.selectedDeposit.menu_items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // 새 아이템 추가
                updatedMenuItems = [...prevState.selectedDeposit.menu_items, currentMenuItem];
            }
    
            const totalAmount = updatedMenuItems.reduce((sum, item) => {
                return sum + (Number(item.price) * item.quantity);
            }, 0);
    
            return {
                ...prevState,
                selectedDeposit: {
                    ...prevState.selectedDeposit,
                    menu_items: updatedMenuItems,
                    transaction_amount: totalAmount
                }
            };
        });
    
        // 입력 필드 초기화
        setCurrentMenuItem({ deposit_type: "", name: "", price: 0 });
    };

    const handleDepositTypeToggle = (depositType, isChecked) => {
        if (isChecked) {
            // 새로운 타입 추가
            setCurrentMenuItem({
                deposit_type: depositType,
                name: `${depositType} 이름 예시`, // 실제 이름 값 할당
                price: 0, // 실제 금액 값 할당
            });
            handleAddMenuItem();
        } else {
            // 기존 타입 제거
            setState(prevState => {
                const updatedMenuItems = prevState.selectedDeposit.menu_items.filter(
                    item => item.deposit_type !== depositType
                );
                const totalAmount = updatedMenuItems.reduce(
                    (sum, item) => sum + (Number(item.price) * item.quantity), 
                    0
                );
                return {
                    ...prevState,
                    selectedDeposit: {
                        ...prevState.selectedDeposit,
                        menu_items: updatedMenuItems,
                        transaction_amount: totalAmount
                    }
                };
            });
        }
    };

    const handleAddDeposit = () => {
        setState(prev => ({
            ...prev,
            selectedDeposit: { ...prev.selectedDeposit, transaction_amount: "" },
            isEditing: false,
            isOpen: true,
        }));
    };

    const handleMinusDeposit = () => {
        setState(prev => ({
            ...prev,
            selectedDeposit: { transaction_amount: "" },
            isEditing: false,
            isDeductedOpen: true,
        }));
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
        const cardResponse = await axios.get(`${API_URLS.CARDS}/${depositData.card_id}`);
        const cardData = cardResponse.data;
    
        let updatedBalance = parseFloat(cardData.balance);
        let updatedRolloverAmount = parseFloat(cardData.rollover_amount);
        let updatedTeamFund = parseFloat(cardData.team_fund);
    
        // 모든 관련 트랜잭션 가져오기
        const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${depositData.card_id}`);
        const transactions = transactionsResponse.data;
    
        // 이 입금 이후 사용된 내역이 있는지 확인
        const hasPostDepositTransactions = transactions.some(transaction => {
            const transactionDate = new Date(transaction.transaction_date);
            return transactionDate > depositDate && transaction.transaction_type === "expense";
        });
    
        if (hasPostDepositTransactions) {
            setState(prev => ({ ...prev, errMsg: "이 입금 이후에 사용된 내역이 있어 삭제할 수 없습니다." }));
            return;
        }
    
        // 메뉴 항목 기반 잔액 조정 처리
        depositData.menu_items.forEach(item => {
            const totalAmount = item.price * item.quantity;
    
            if (item.deposit_type === "RegularDeposit") {
            // 잔액 차감 및 이월 잔액 처리
            if (updatedBalance >= totalAmount) {
                updatedBalance -= totalAmount;
            } else {
                const remainingAmount = totalAmount - updatedBalance;
                updatedBalance = 0;
                updatedRolloverAmount = Math.max(updatedRolloverAmount - remainingAmount, 0);
            }
            } else if (item.deposit_type === "TeamFund") {
            // 팀 운영비 차감
            updatedTeamFund = Math.max(updatedTeamFund - totalAmount, 0);
            }
        });
    
        // 카드 데이터 업데이트
        await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
            balance: updatedBalance,
            rollover_amount: updatedRolloverAmount,
            team_fund: updatedTeamFund,
        });
    
        // 트랜잭션 삭제
        await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
        setState(prev => ({ ...prev, isDeleteConfirmOpen: false, errMsg: "", isOpen: false }));
        } catch (error) {
        console.error("Error during deletion:", error);
        setState(prev => ({ ...prev, errMsg: "삭제 중 오류가 발생했습니다." }));
        }
    };
    
    // const handleDelete = async () => {
    //     try {
    //         const { selectedDeposit } = state;

    //         if (!selectedDeposit || !selectedDeposit._id) {
    //             setState(prev => ({ ...prev, errMsg: "선택된 입금 내역이 유효하지 않습니다." }));
    //             return;
    //         }

    //         const response = await axios.get(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
    //         const depositData = response.data;
            
    //         const depositDate = new Date(depositData.transaction_date);
    //         const depositAmount = parseFloat(depositData.transaction_amount);

    //         const cardResponse = await axios.get(`${API_URLS.CARDS}/${depositData.card_id}`);
    //         const cardData = cardResponse.data;
    //         let updatedBalance = parseFloat(cardData.balance);
    //         let rolloverAmount = parseFloat(cardData.rollover_amount);
    //         const isTeamFund = depositData.deposit_type === 'TeamFund';

    //         const transactionsResponse = await axios.get(`${API_URLS.CARD_TRANSACTIONS}/${depositData.card_id}`);
    //         const transactions = transactionsResponse.data;

    //         const hasPostDepositTransactions = transactions.some(transaction => {
    //             const transactionDate = new Date(transaction.transaction_date);
    //             return transactionDate > depositDate && transaction.transaction_type === 'expense';
    //         });

    //         if (hasPostDepositTransactions) {
    //             setState(prev => ({ ...prev, errMsg: "이 입금 이후에 사용된 내역이 있어 삭제할 수 없습니다." }));
    //             return;
    //         }

    //         if (isTeamFund) {
    //             let updatedTeamFund = Math.max(parseFloat(cardData.team_fund) - depositAmount, 0);
    //             await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
    //                 team_fund: updatedTeamFund,
    //             });
    //         } else {
    //             if (updatedBalance - depositAmount < 0) {
    //                 const remainingAmountToDeduct = depositAmount - updatedBalance;
    //                 updatedBalance = 0;
    //                 rolloverAmount = Math.max(rolloverAmount - remainingAmountToDeduct, 0);
    //             } else {
    //                 updatedBalance -= depositAmount;
    //             }

    //             await axios.put(`${API_URLS.CARDS}/${depositData.card_id}`, {
    //                 balance: updatedBalance,
    //                 rollover_amount: rolloverAmount,
    //             });
    //         }

    //         await axios.delete(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`);
    //         setState(prev => ({ ...prev, isDeleteConfirmOpen: false, errMsg: "", isOpen: false }));
    //     } catch (error) {
    //         setState(prev => ({ ...prev, errMsg: "삭제 중 오류가 발생했습니다." }));
    //     }
    // };

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
                    menu_items: [],
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

    const calculateTotalAmount = () => {
        return state.selectedDeposit.menu_items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    };
    
    const handleRemoveMenuItem = (index) => {
        setState((prevState) => ({
            ...prevState,
            selectedDeposit: {
            ...prevState.selectedDeposit,
            menu_items: prevState.selectedDeposit.menu_items.filter((_, i) => i !== index),
            },
        }));
    };
    
    const handleTransactionDateChange = (e) => {
        const selectedDate = e.target.value;
    
        setState(prevState => ({
            ...prevState,
            selectedDeposit: {
                ...prevState.selectedDeposit,
                transaction_date: selectedDate
            },
        }));
    };
    
    const handleSave = async () => {
        try {
            const { selectedUserId, selectedCardId, selectedDeposit, isDeductedOpen, isEditing } = state;
        
            if (!selectedUserId || !selectedCardId || !selectedDeposit.transaction_amount) {
            setState(prev => ({ ...prev, errMsg: "모든 필드를 채워주세요." }));
            return;
            }
        
            const transactionAmount = parseFloat(selectedDeposit.transaction_amount);
            if (transactionAmount <= 0) throw new Error("유효하지 않은 입금 금액입니다.");
        
            const transactionType = isDeductedOpen ? "expense" : "income";
        
            // menu_items 배열이 유효한 경우 기존 값 유지, 없으면 기본값 사용
            const menuItems = selectedDeposit.menu_items?.length
            ? selectedDeposit.menu_items.map(item => ({
                deposit_type: item.deposit_type,
                name: item.name || (item.deposit_type === "TeamFund" ? "팀 운영비" : "월 잔액 충전"),
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity, 10) || 1,
                }))
            : [{
                deposit_type: selectedDeposit.deposit_type,
                name: selectedDeposit.deposit_type === "TeamFund" ? "팀 운영비" : "월 잔액 충전",
                price: transactionAmount,
                quantity: 1,
                }];

            const transactionData = {
                card_id: selectedCardId,
                merchant_name: "관리자",
                menu_items: menuItems,
                transaction_type: transactionType,
                is_deducted: isDeductedOpen,
                transaction_date: selectedDeposit?.transaction_date || new Date().toISOString().split("T")[0],
            };
        
            if (isEditing) {
            await axios.put(`${API_URLS.TRANSACTIONS}/${selectedDeposit._id}`, transactionData);
            } else {
            await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }
        
            await fetchData(`${API_URLS.DEPOSITS}/${currentYear}/${currentMonth}`, "deposits");
            setState(prev => ({ ...prev, isOpen: false, errMsg: "" }));
        } catch (error) {
            setState(prev => ({ ...prev, errMsg: error.response?.data?.message || error.message }));
        }
    };
        
    return {
        state,
        currentMenuItem,
        setCurrentMenuItem,
        setState,
        fetchData,
        fetchFilteredMembers,
        handleDelete,
        handleDeleteConfirm,
        handleDeleteCancel,
        handleOpenDrawer,
        handleCloseDrawer,
        handleDepositTypeAdd,
        handleAddMenuItem,
        handleDepositTypeToggle,
        handleSave,
        handleAddDeposit,
        handleMinusDeposit,
        handleUserChange,
        handleCardChange,
        calculateTotalAmount,
        handleRemoveMenuItem,
        handleTransactionDateChange,
    };
};

export default useDepositManagement;