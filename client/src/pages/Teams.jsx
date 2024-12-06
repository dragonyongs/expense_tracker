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
            <div className="flex flex-col gap-y-2 px-4 pb-4">
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

const AccountList = ({ accounts, userPosition, userName, remainingDays }) => {
    return (
        <>
            {accounts.map(account => {
                const hasOvertimeMealCard = account.cards.some(card => card.card_type === "OvertimeMealCard");
                const isLeaderAccount = account.cards.some(card => card.position === "팀장");
                const isPartLeaderAccount = account.cards.some(card => card.position === "파트장" );
                const isUserAccount = account.cards.some(card => card.member_name === userName);

                if (userPosition === "파트장" && isLeaderAccount && !hasOvertimeMealCard) {
                    return null;
                }

                if (
                    userPosition === "팀원" &&
                    (isLeaderAccount || isPartLeaderAccount) && // 팀장 또는 파트장 계좌
                    !hasOvertimeMealCard && // 야근식대가 아닌 경우
                    !isUserAccount // 자신의 카드가 아닌 경우
                ) {
                    return null;
                }
                
                return (
                    <AccountCard
                        key={account._id}
                        account={account}
                        userPosition={userPosition}
                        remainingDays={remainingDays}
                    />
                );
            })}
        </>
    );
};


const calculateTotalBalance = (cards) => {
    return cards.reduce((sum, card) => sum + card.balance + card.rollover_amount + card.team_fund, 0);
};

const AccountCard = ({ account, userPosition, remainingDays }) => {
    const totalBalance = calculateTotalBalance(account.cards); // 전체 카드의 잔액 합계

    // 팀장 및 야근식대 카드 분리
    const leaderCards = account.cards.filter(card => card.position === "팀장" && card.card_type !== "OvertimeMealCard");
    const overtimeMealCards = account.cards.filter(card => card.card_type === "OvertimeMealCard");
    const otherCards = account.cards.filter(card => card.position !== "팀장" && card.card_type !== "OvertimeMealCard");

    return (
        <div className="pt-8 px-8 bg-white shadow-sm rounded-xl border-t dark:border dark:border-slate-600 dark:bg-slate-700">
            {/* 계좌 정보 */}
            <h3 className="text-md text-gray-500">
                {account.team_id.team_name} {account.account_number.split('-').slice(-1)} 계좌
            </h3>
            <h3 className="text-2xl text-gray-700 dark:text-slate-300 mt-2">
                <span className="font-bold">{totalBalance.toLocaleString()}원</span>
                {totalBalance > 0 && " 남음"}
            </h3>

            <div className="mt-8">
                {/* 야근식대 카드는 모두에게 표시 */}
                {overtimeMealCards.length > 0 && (
                    <div>
                        {overtimeMealCards.map(card => (
                            <CardDetail
                                key={card.card_number}
                                card={card}
                                remainingDays={remainingDays}
                                isOvertimeMealCard={true} // 명시적으로 전달
                            />
                        ))}
                    </div>
                )}

                {/* 팀장의 카드 정보는 팀장만 볼 수 있음 */}
                {userPosition === "팀장" && leaderCards.length > 0 && (
                    <LeaderCardDetail leaderCards={leaderCards} />
                )}

                {/* 팀원의 카드 정보 */}
                {otherCards.length > 0 && otherCards.map(card => (
                    <CardDetail
                        key={card.card_number}
                        card={card}
                        teamMembersCount={account.cards.length}
                        remainingDays={remainingDays}
                        isOvertimeMealCard={false}
                    />
                ))}
            </div>
        </div>
    );
};


const LeaderCardDetail = ({leaderCards}) => {
    const totalBalance = leaderCards.reduce((sum, card) => sum + card.balance + card.rollover_amount, 0);
    const teamFund = leaderCards.find(card => card.team_fund)?.team_fund || 0;
    return (
        <div className="mb-10">
            <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                <span className="text-lg font-bold dark:text-slate-400">
                    {leaderCards[0].member_name}
                </span>
                <span className="text-base">{leaderCards[0].position}</span>
            </h3>
            {leaderCards.map(card => (
                <div key={card.card_number} className="flex justify-between mt-4 pt-4 border-t dark:border-slate-600">
                    <h4 className="text-md dark:text-slate-500">팀 카드비</h4>
                    <span className="text-lg font-bold dark:text-slate-400">
                        {card.balance.toLocaleString()}원
                    </span>
                </div>
            ))}

            {/* 팀 운영비 표시 */}
            {teamFund > 0 && (
                <div className="flex justify-between mt-2">
                    <h4 className="text-md dark:text-slate-500">팀 운영비</h4>
                    <span className="text-lg font-bold dark:text-slate-400">
                        {teamFund.toLocaleString()}원
                    </span>
                </div>
            )}

            {/* 전체 잔액 (카드 + 팀 운영비) */}
            <div className="flex justify-between mt-4 border-t pt-2 dark:border-slate-600">
                <h4 className="text-md font-bold dark:text-slate-500">총 잔액</h4>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(totalBalance + teamFund).toLocaleString()}원
                </span>
            </div>

        </div>
    );
};

const CardDetail = ({ card, teamMembersCount, remainingDays, isOvertimeMealCard }) => {
    const totalAmount = card.balance + card.rollover_amount;
    const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;

    return (
        <div className="mb-10">
            <div className="flex justify-between mb-4">
                <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                    <span className="text-lg font-bold dark:text-slate-400">
                        {isOvertimeMealCard ? "야근 식대" : card.member_name}
                    </span>
                    {!isOvertimeMealCard && <span className="text-base">{card.position}</span>}
                </h3>
                <span className="text-lg">
                    <span className="font-bold dark:text-slate-400">{totalAmount.toLocaleString()}원</span>
                    {totalAmount > 0 && <span className="dark:text-slate-500"> 남음</span>}
                </span>
            </div>
            <ProgressBars spentPercentage={spentPercentage} isWarning={remainingDays <= 7} />
        </div>
    );
};

export default Teams;
