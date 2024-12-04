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
                        userId={user.member_id}
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

const AccountList = ({ accounts, userPosition, userId, remainingDays }) => (
    <>
        {accounts.map(account => (
            <AccountCard
                key={account._id}
                account={account}
                userPosition={userPosition}
                userId={userId}
                remainingDays={remainingDays}
            />
        ))}
    </>
);

const AccountCard = ({ account, userPosition, userId, remainingDays }) => {
    const totalBalance = account.cards.reduce((sum, card) => 
        sum + card.balance + card.rollover_amount + (card.team_fund || 0), 0);

    // 카드 필터링 함수
    const filterCards = (cardType = null, position = null) => {
        return account.cards.filter(card => {
            // 야근식대는 모든 직책에서 볼 수 있음
            if (cardType === "OvertimeMealCard") {
                return card.card_type === "OvertimeMealCard";
            }

            // 팀장의 경우 모든 카드 접근 가능
            if (userPosition === "팀장") {
                return position ? card.position === position : true;
            }

            // 파트장의 경우
            if (userPosition === "파트장") {
                // 팀장 카드는 접근 불가
                if (card.position === "팀장") return false;
                
                // 파트장, 팀원 카드 접근 가능
                return position ? card.position === position : 
                       (card.position === "파트장" || card.position === "팀원");
            }

            // 팀원의 경우
            if (userPosition === "팀원") {
                // 팀장, 파트장 카드는 접근 불가
                if (card.position === "팀장" || card.position === "파트장") return false;
                
                // 본인 카드만 접근 가능
                return card.member_id === userId;
            }

            return false;
        });
    };

    // 각 직책별 카드 필터링
    const leaderCards = filterCards(null, "팀장");
    const partLeaderCards = filterCards(null, "파트장");
    const teamMemberCards = filterCards(null, "팀원");
    const overtimeMealCards = filterCards("OvertimeMealCard");
    const myCards = filterCards(null).filter(card => card.member_id === userId);

    return (
        <div className="pt-8 px-8 bg-white shadow-sm rounded-xl border-t dark:border dark:border-slate-600 dark:bg-slate-700">
            <h3 className="text-md text-gray-500">
                {account.team_id.team_name} {account.account_number.split('-').slice(-1)} 계좌
            </h3>
            <h3 className="text-2xl text-gray-700 dark:text-slate-300 mt-2">
                <span className="font-bold">{totalBalance.toLocaleString()}원</span>
                {totalBalance > 0 && " 남음"}
            </h3>

            <div className="mt-8">
                {/* 팀장의 경우만 팀장 카드 렌더링 */}
                {userPosition === "팀장" && leaderCards.length > 0 && (
                    <LeaderCardDetail 
                        leaderCards={leaderCards}
                        remainingDays={remainingDays} 
                    />
                )}

                {/* 파트장의 경우 파트장 카드 렌더링 */}
                {(userPosition === "팀장" || userPosition === "파트장") && partLeaderCards.length > 0 && (
                    partLeaderCards.map(card => (
                        <CardDetail 
                            key={card.card_number}
                            card={card}
                            remainingDays={remainingDays}
                        />
                    ))
                )}

                {/* 팀장, 파트장의 경우 팀원 카드 렌더링 */}
                {(userPosition === "팀장" || userPosition === "파트장") && teamMemberCards.length > 0 && (
                    teamMemberCards.map(card => (
                        <CardDetail 
                            key={card.card_number}
                            card={card}
                            remainingDays={remainingDays}
                        />
                    ))
                )}

                {/* 팀원의 경우 본인 카드만 렌더링 */}
                {userPosition === "팀원" && myCards.length > 0 && (
                    myCards.map(card => (
                        <CardDetail 
                            key={card.card_number}
                            card={card}
                            remainingDays={remainingDays}
                        />
                    ))
                )}

                {/* 야근식대 카드는 모든 직책에서 렌더링 */}
                {overtimeMealCards.length > 0 && (
                    overtimeMealCards.map(card => (
                        <CardDetail 
                            key={card.card_number}
                            card={card}
                            remainingDays={remainingDays}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const LeaderCardDetail = ({ leaderCards, remainingDays }) => {
    const totalBalance = leaderCards.reduce((sum, card) => 
        sum + card.balance + card.rollover_amount, 0);
    
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
                    <h4 className="text-md dark:text-slate-500">개인 사용</h4>
                    <span className="text-lg font-bold dark:text-slate-400">
                        {card.balance.toLocaleString()}원
                    </span>
                </div>
            ))}

            {teamFund > 0 && (
                <div className="flex justify-between mt-2">
                    <h4 className="text-md dark:text-slate-500">팀 운영비</h4>
                    <span className="text-lg font-bold dark:text-slate-400">
                        {teamFund.toLocaleString()}원
                    </span>
                </div>
            )}

            <div className="flex justify-between mt-4 border-t pt-2 dark:border-slate-600">
                <h4 className="text-md font-bold dark:text-slate-500">총 잔액</h4>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(totalBalance + teamFund).toLocaleString()}원
                </span>
            </div>
        </div>
    );
};

const CardDetail = ({ card, remainingDays }) => {
    const totalAmount = card.balance + card.rollover_amount;
    const spentPercentage = ((card.limit - card.balance) / card.limit) * 100;
    const isOvertimeMealCard = card.card_type === "OvertimeMealCard";
    const isWarning = (totalAmount > (card.limit / 2)) && remainingDays <= 7;

    return (
        <div className="mb-10">
            <div className="flex justify-between mb-4">
                <h3 className="flex gap-x-2 items-center dark:text-slate-500">
                    <span className="text-lg font-bold dark:text-slate-400">
                        {isOvertimeMealCard ? "야근 식대" : card.member_name}
                    </span>
                    {!isOvertimeMealCard && <span className="text-base">{card.position}</span>}
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

export default Teams;