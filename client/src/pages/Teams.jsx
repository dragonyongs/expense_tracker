import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';
import Loading from '../components/Loading';
import { PiCreditCardLight } from "react-icons/pi";
import ProgressBars from '../components/ProgressBars';

function Teams() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPosition, setUserPosition] = useState('');
    const [remainingDays, setRemainingDays] = useState(0);

    const fetchData = async (url) => {
        try {
            const response = await axios.get(url, {
                withCredentials: true
            });
            setAccounts(response.data);
            const userInfo = response.data.find(account => 
                account.cards.some(card => card.member_id === user.member_id)
            );
            setUserPosition(userInfo ? userInfo.cards[0].position : '');
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}`);
        calculateRemainingDays(); // 날짜 계산 추가
    }, []);

    // 남은 일수 계산
    const calculateRemainingDays = () => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysLeft = (lastDayOfMonth - today) / (1000 * 60 * 60 * 24);
        setRemainingDays(Math.ceil(daysLeft));
    };

    const handleTeamOperatingFundSpent = (account) => {
        const teamLeaderCard = account.cards.find(card => card.position === "팀장" && card.member_id === user.member_id);
        if (!teamLeaderCard) return 0;
    
        const totalCards = accounts.reduce((sum, account) => sum + account.cards.length, 0);
    
        // 팀원 수에 따른 총 팀 운영비 한도 계산 (팀원 수 * 30,000)
        const totalTeamFundLimit = totalCards * 30000;
    
        // 사용된 팀 운영비 퍼센트 계산 (잔액 기준)
        const remainingFund = teamLeaderCard.team_fund;  // 현재 남은 금액
        const usedFund = totalTeamFundLimit - remainingFund;  // 사용한 금액
        const teamFundPercentage = totalTeamFundLimit > 0 ? (usedFund / totalTeamFundLimit) * 100 : 0;
        
        return teamFundPercentage;
    };


    if (loading) {
        return <Loading type="ThreeDots" />;
    }

    return (
        <>
            <header className={`flex justify-between items-center py-4 px-6 bg-white dark:text-white dark:bg-slate-800 dark:text-slate-200'}`}>
                <div className='text-2xl' >
                    <span className='font-semibold'>팀계좌</span>
                </div>
            </header>
            <div className='flex flex-col gap-y-2'>
                {accounts.length === 0 ? 
                    (
                        <div className="flex flex-col justify-center items-center h-default-screen text-gray-500 dark:text-gray-400">
                            <PiCreditCardLight className='w-20 h-20'/>
                            <p>지정된 카드가 존재하지 않습니다.</p>
                        </div>
                    ) : 
                    (
                        accounts
                            .filter(account => {
                                const isTeamLeader = account.cards.some(card => card.position === "팀장");
                                return userPosition === "팀장" || !isTeamLeader;
                            })
                            .sort((a, b) => {
                                const aIsLeader = a.cards.some(card => card.position === "팀장");
                                const bIsLeader = b.cards.some(card => card.position === "팀장");
                                return (bIsLeader ? 1 : 0) - (aIsLeader ? 1 : 0);
                            })
                            .map(account => {
                                const totalBalance = account.cards.reduce((sum, card) => sum + card.balance, 0);
                                const teamMembersCount = account.cards.filter(card => card.position !== '팀장').length;
        
                                // 팀 운영비 계산
                                const teamOperatingFundBalance = account.cards.find(card => card.position === "팀장")?.team_fund || 0; // 팀장의 team_fund 가져오기
                                const teamOperatingFundPercentage = handleTeamOperatingFundSpent(account);

                                return (
                                    <div key={account._id} className='pt-8 px-8 bg-white shadow-sm border-t border-t-gray-200 dark:border-t-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                                        <h3 className='text-lg'>{account.team_id.team_name} {account.account_number.split('-')[account.account_number.split('-').length - 1]} 계좌</h3>
                                        <h3 className='text-2xl tracking-tight text-gray-700 dark:text-slate-300 mt-2 dark:font-thin'>
                                            <span className='font-bold text-black dark:text-slate-300 dark:font-normal'>{(totalBalance + teamOperatingFundBalance).toLocaleString()}원</span> {totalBalance > 0 ? "남음" : ""}
                                        </h3>
        
                                        <div className='mt-8'>
                                            {account.cards
                                                .filter(card => userPosition === "팀장" || card.position !== "팀장")
                                                .map(card => {
                                                    // 기본 금액 (모두 동일하게 10만 원)
                                                    const totalAmount = card.limit + card.rollover_amount;
                                                    const spentAmount = card.limit - card.balance;
                                                    const spentPercentage = totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0;
        
                                                    // 팀원 수에 따라 기준 금액 설정 (1만원을 팀원 수로 나눈 금액)
                                                    const individualLimit = 10000 / teamMembersCount;
                                                    const isLimit = individualLimit < card.balance;
        
                                                    // 잔액이 기준 금액보다 많고 남은 일수가 7일 이하일 때 빨간색 표시
                                                    const isWarning = isLimit && remainingDays <= 7;
        
                                                    return (
                                                        <div key={card.card_number} className='mb-10'>
                                                            <div className='flex justify-between mb-4'>
                                                                <h3 className='flex gap-x-2 items-center'>
                                                                    <span className={`text-lg font-bold`}>{card.member_name}</span>
                                                                    <span className='text-base'>{card.position}</span>
                                                                </h3>
                                                                <span className={`text-lg text-gray-400 dark:text-slate-400`}>
                                                                    <span className={`font-bold text-black dark:font-normal dark:text-slate-200 ${isWarning ? 'text-red-600 dark:text-red-400' : '' } `}>
                                                                        {card.balance.toLocaleString()}원
                                                                    </span> 
                                                                    <span className='text-base'>{card.balance > 0 ? "남음" : "" }</span>
                                                                </span>
                                                            </div>
                                                            
                                                            <ProgressBars spentPercentage={spentPercentage} isWarning={isWarning} />
                                                        </div>
                                                    );
                                                })}
        
                                            {/* 팀장의 운영비 표시 */}
                                            {account.cards.some(card => card.position === "팀장") && (
                                                <div className='mb-10'>
                                                    <div className='flex justify-between mb-4'>
                                                        <h3 className='flex gap-x-2 items-center'>
                                                            <span className={`text-lg font-bold`}>팀 운영비</span>
                                                        </h3>
                                                        <span className={`text-lg text-gray-400 dark:text-slate-400`}>
                                                            <span className={`font-bold text-black dark:font-normal dark:text-slate-200`}>
                                                                {teamOperatingFundBalance.toLocaleString()}원
                                                            </span> 
                                                            <span className='text-base'>{teamOperatingFundBalance > 0 ? "남음" : "" }</span>
                                                        </span>
                                                    </div>
                                                    <ProgressBars spentPercentage={teamOperatingFundPercentage} isWarning={false} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    )}
            </div>
        </>
    );
    
}

export default Teams;
