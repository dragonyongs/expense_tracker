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
            const response = await axios.get(url, { withCredentials: true });
            console.log(response.data);
            const fetchedAccounts = response.data;
            
            setAccounts(fetchedAccounts);
    
            const userCard = fetchedAccounts
                .flatMap(account => account.cards)
                .find(card => card.member_id === user.member_id);
    
            setUserPosition(userCard ? userCard.position : '');
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}/${user.member_id}`);
        calculateRemainingDays();
    }, []);

    const calculateRemainingDays = () => {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const daysLeft = (lastDayOfMonth - today) / (1000 * 60 * 60 * 24);
        setRemainingDays(Math.ceil(daysLeft));
    };

    if (loading) {
        return <Loading type="ThreeDots" />;
    }

    return (
        <>
            <header className="flex justify-between items-center py-4 px-6 dark:text-white dark:bg-slate-800">
                <div className="text-2xl">
                    <span className="font-semibold">팀계좌</span>
                </div>
            </header>
            <div className="flex flex-col gap-y-2 px-4">
                {accounts.length === 0 ? (
                    <NoCardMessage />
                ) : (
                    <AccountList 
                        accounts={accounts} 
                        userPosition={userPosition} 
                        remainingDays={remainingDays} 
                    />
                )}
            </div>
        </>
    );
}

const NoCardMessage = () => (
    <div className="flex flex-col justify-center items-center h-default-screen text-gray-500 dark:text-gray-400">
        <PiCreditCardLight className="w-20 h-20" />
        <p>지정된 카드가 존재하지 않습니다.</p>
    </div>
);

const AccountList = ({ accounts, userPosition, remainingDays }) => {
    const filterCardsByPosition = (cards, userPosition) => {
        const filterRules = {
            "팀장": () => true,
            "파트장": card => card.position !== "팀장",
            "팀원": card => card.position === "팀원",
        };
    
        return cards.filter(filterRules[userPosition] || (() => false));
    };
    
    // 적용
    const filteredAccounts = accounts.map(account => ({
        ...account,
        cards: filterCardsByPosition(account.cards, userPosition),
    })).filter(account => account.cards.length > 0);
 
    return (
        <>
            {filteredAccounts.map(account => (
                <AccountCard
                    key={account._id}
                    account={account}
                    userPosition={userPosition}
                    remainingDays={remainingDays}
                />
            ))}
        </>
    );
};

const AccountCard = ({ account, userPosition, remainingDays }) => {
    const totalBalance = calculateTotalBalance(account.cards);
    const teamOperatingFundBalance = account.cards.find(card => card.position === "팀장")?.team_fund || 0;
    const teamOperatingFundPercentage = handleTeamOperatingFundSpent(account, totalBalance);

    return (
        <div className="pt-8 px-8 bg-white shadow-sm rounded-xl border-t dark:border dark:border-slate-600 dark:bg-slate-700">
            <h3 className="text-md text-gray-500">
                {account.team_id.team_name} {account.account_number.split('-').slice(-1)} 계좌
            </h3>
            <h3 className="text-2xl text-gray-700 dark:text-slate-300 mt-2">
                <span className="font-bold">{(totalBalance + teamOperatingFundBalance).toLocaleString()}원</span>
                {totalBalance > 0 && " 남음"}
            </h3>

            <div className="mt-8">
                {filterCardsByPosition(account.cards, userPosition).map(card => (
                    <CardDetail 
                        key={card.card_number} 
                        card={card} 
                        teamMembersCount={account.cards.length - 1} 
                        remainingDays={remainingDays} 
                    />
                ))}

                {/* 팀장의 운영비 표시 (팀장일 경우에만) */}
                {userPosition === "팀장" && account.cards.some(card => card.position === "팀장") && (
                    <TeamOperatingFundCard 
                        balance={teamOperatingFundBalance} 
                        percentage={teamOperatingFundPercentage} 
                    />
                )}
            </div>
        </div>
    );
};

const CardDetail = ({ card, teamMembersCount, remainingDays }) => {
    const totalAmount = card.balance + card.rollover_amount;
    const individualLimit = 10000 / teamMembersCount;
    const isWarning = individualLimit < totalAmount && remainingDays <= 7;
    const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;

    return (
        <div className="mb-10">
            <div className="flex justify-between mb-4">
                <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                    <span className="text-lg font-bold dark:text-slate-400">{card.member_name}</span>
                    <span className="text-base">{card.position}</span>
                </h3>
                <span className={`text-lg ${isWarning ? 'text-red-600 dark:text-red-700' : ''}`}>
                    <span className="font-bold dark:text-slate-400">{totalAmount.toLocaleString()}원</span>
                    <span className='dark:text-slate-500'>{totalAmount > 0 && " 남음"}</span>
                </span>
            </div>
            <ProgressBars spentPercentage={spentPercentage} isWarning={isWarning} />
        </div>
    );
};

const TeamOperatingFundCard = ({ balance, percentage }) => (
    <div className="mb-10">
        <div className="flex justify-between mb-4">
            <h3 className="text-lg font-bold dark:text-slate-400">팀 운영비</h3>
            <span className="text-lg">
                <span className="font-bold dark:text-slate-400">{balance.toLocaleString()}원</span>
                <span className='dark:text-slate-500'>{balance > 0 && " 남음"}</span>
            </span>
        </div>
        <ProgressBars spentPercentage={percentage} isWarning={false} />
    </div>
);

const calculateTotalBalance = (cards) => {
    return cards.reduce((sum, card) => sum + card.balance + card.rollover_amount, 0);
};

const filterCardsByPosition = (cards, userPosition) => {
    if (userPosition === "팀장") return cards;
    if (userPosition === "파트장") return cards.filter(card => card.position !== "팀장");
    return cards.filter(card => !["팀장", "파트장"].includes(card.position));
};

const handleTeamOperatingFundSpent = (account, totalBalance) => {
    const teamLeaderCard = account.cards.find(card => card.position === "팀장");
    if (!teamLeaderCard) return 0;

    const totalTeamFundLimit = account.cards.length * 30000;
    const remainingFund = teamLeaderCard.team_fund || 0;
    const usedFund = totalTeamFundLimit - remainingFund;

    return totalTeamFundLimit > 0 ? (usedFund / totalTeamFundLimit) * 100 : 0;
};

export default Teams;