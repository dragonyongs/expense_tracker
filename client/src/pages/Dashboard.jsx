import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import CardBalance from '../components/CardBalance';
import PayHistory from '../components/PayHistory';
import Header from '../components/Header';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [cardBalance, setCardBalance] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [userCards, setUserCards] = useState([]);
    const [teamFund, setTeamFund] = useState(0);
    const [errMsg, setErrMsg] = useState('');
    const [confettiTrigger, setConfettiTrigger] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(API_URLS.TRANSACTIONS);
            setTransactions(response.data);
        } catch (error) {
            setErrMsg(error.response?.data?.message || '오류가 발생했습니다.');
        }
    };

    const fetchUserCard = async () => {
        if (user?.member_id) {
            try {
                const response = await axios.get(`${API_URLS.CARD_MEMBER}/${user.member_id}`);
                if (response.data.length > 0) {
                    const userCard = response.data[0];
                    const currentBalanceWithRollover = userCard.balance + (userCard.rollover_amount || 0) + (userCard.team_fund || 0);
                    setCurrentBalance(currentBalanceWithRollover);
                    setUserCards(response.data);
                    setCardBalance(userCard.balance || 0);
                    setTeamFund(userCard.team_fund || 0);
                }
            } catch (error) {
                setErrMsg(error.response?.data?.message || '오류가 발생했습니다.');
            }
        }
    };

    useEffect(() => {
        fetchTransactions();
        fetchUserCard();
    }, [user?.member_id]);

    const handleSaveTransaction = async (newTransaction) => {
        const transactionData = {
            card_id: newTransaction.card_id,
            expense_card: newTransaction.expense_card,
            expense_type: newTransaction.expense_type,
            merchant_name: newTransaction.merchant_name,
            menu_items: newTransaction.menu_items || [],
            transaction_type: "expense",
            transaction_amount: newTransaction.transaction_amount,
            transaction_date: newTransaction.transaction_date,
            is_deducted: false,
        };

        try {
            if (newTransaction._id) {
                await axios.put(`${API_URLS.TRANSACTIONS}/${newTransaction._id}`, transactionData);
            } else {
                await axios.post(API_URLS.TRANSACTIONS, transactionData);
            }
            await fetchTransactions();
            await fetchUserCard(); 
            setConfettiTrigger(true);
            setTimeout(() => setConfettiTrigger(false), 3000);
        } catch (error) {
            setErrMsg(error.response?.data?.message || '오류가 발생했습니다.');
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            await axios.delete(`${API_URLS.TRANSACTIONS}/${transactionId}`);
            await fetchTransactions();
            await fetchUserCard();
        } catch (error) {
            setErrMsg(error.response?.data?.message || '오류가 발생했습니다.');
        }
    };

    return (
        <>
            <Header />
            <div className='flex flex-col w-full'>
                {user.role === 'super_admin' ? (
                    <div className='p-8'>
                        <p>{user.role}</p>
                    </div>
                ) : (
                    <div className='h-full bg-white dark:bg-slate-800'>
                        <CardBalance
                            onSave={handleSaveTransaction}
                            onDelete={handleDeleteTransaction}
                            currentBalance={currentBalance}
                            teamFund={teamFund}
                            userCards={userCards}
                            cardBalance={cardBalance}
                            errMsg={errMsg}
                            isDrawerOpen={isDrawerOpen}
                            confettiTrigger={confettiTrigger}
                            onOpenDrawer={() => setIsDrawerOpen(true)}
                            onCloseDrawer={() => setIsDrawerOpen(false)}
                        />
                        <PayHistory
                            transactions={transactions}
                            onDelete={handleDeleteTransaction}
                            userCards={userCards}
                            errMsg={errMsg}
                            setErrMsg={setErrMsg}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Dashboard;