import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from "../services/axiosInstance";
import { API_URLS } from '../services/apiUrls';

function Teams() {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userPosition, setUserPosition] = useState(''); // 유저의 포지션을 저장할 상태

    const fetchData = async (url) => {
        try {
            const response = await axios.get(url, {
                withCredentials: true // 쿠키를 전송하는 옵션
            });
            console.log(response.data);
            setAccounts(response.data);
            // 유저의 포지션 설정
            const userInfo = response.data.find(account => 
                account.cards.some(card => card.member_id === user.member_id)
            );
            setUserPosition(userInfo ? userInfo.cards[0].position : ''); // 포지션 설정
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(`${API_URLS.ACCOUNTS_WITH_CARDS}`);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className='flex flex-col gap-y-2 h-full'>
                {accounts
                    .filter(account => {
                        // 팀원이면서 팀장 카드가 있는 계좌는 렌더링하지 않음
                        const isTeamLeader = account.cards.some(card => card.position === "팀장");
                        return userPosition === "팀장" || !isTeamLeader;
                    })
                    .sort((a, b) => {
                        // 팀장 계정이 먼저 나오도록 정렬
                        const aIsLeader = a.cards.some(card => card.position === "팀장");
                        const bIsLeader = b.cards.some(card => card.position === "팀장");
                        return (bIsLeader ? 1 : 0) - (aIsLeader ? 1 : 0);
                    })
                    .map(account => {
                        // 카드 잔액의 합계를 계산
                        const totalBalance = account.cards.reduce((sum, card) => sum + card.balance, 0);
    
                        return (
                            <div key={account._id} className='p-8 bg-white shadow-sm'>
                                <h3 className='text-xl'>{account.team_id.team_name} {account.account_number.split('-')[account.account_number.split('-').length - 1]} 계좌 잔액</h3>
                                {/* <h2 className='text-md tracking-tight text-gray-500'>
                                    <span className='font-bold'>{account.bank_name}</span> {account.account_number}
                                </h2> */}
                                <h3 className='text-2xl tracking-tight text-gray-700 mt-2'>
                                    <span className='font-bold text-black'>{totalBalance.toLocaleString()}원</span> 남음
                                </h3>
    
                                <div className='mt-8'>
                                    {account.cards
                                        .filter(card => userPosition === "팀장" || card.position !== "팀장") // 팀장이면 모든 카드, 팀원이면 팀장 카드 제외
                                        .map(card => {
                                            const totalAmount = card.limit + card.rollover_amount; // 카드의 한도 + 이월 금액
                                            const spentAmount = card.limit - card.balance; // 지출 금액
                                            const spentPercentage = totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0;
    
                                            return (
                                                <div key={card.card_number} className='mb-10'>
                                                    <div className='flex justify-between mb-4'>
                                                        <h3 className='flex gap-x-2 items-center'>
                                                            <span className='text-xl font-bold'>{card.member_name}</span>
                                                            <span className='text-xl'>{card.rank} / {card.position}</span>
                                                        </h3>
                                                        <span className='text-xl text-gray-400'>
                                                            <span className='font-bold text-black'>{card.balance.toLocaleString()}원</span> 남음
                                                        </span>
                                                    </div>
                                                    <div className='relative'>
                                                        <div 
                                                            className={`absolute top-0 left-0 h-3 rounded-full ${spentPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${spentPercentage}%` }} // 지출 비율에 따라 너비 설정
                                                        ></div>
                                                        <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </>
    );
    
}

export default Teams;

                {/* <div className='p-8 bg-white shadow-sm'>
                    <h3 className='text-xl mb-3'>팀 운영비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>110,000</span> 원</h2>
                    <div className='flex justify-between mt-10 mb-4'>
                        <span className='text-xl font-bold'>팀 운영비</span>
                        <span className='text-xl text-gray-400'><span className='font-bold text-black'>110,000원</span> 남음</span>
                    </div>
                    <div className='relative'>
                        <div className='absolute top-0 left-0 w-2/4 h-3 bg-blue-500 rounded-full'></div>
                        <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                    </div>
                </div>
                <div className='p-8 bg-white shadow-sm'>
                    <h3 className='text-xl mb-3'>팀장 활동비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>51,000</span> 원</h2>
                    <div className='mt-14'>
                        <div className='flex justify-between mb-4'>
                            <h3 className='flex gap-x-2 items-center'>
                                <span className='text-xl font-bold'>타일러</span>
                                <span className='text-xl '>부장 / 팀장</span>
                            </h3>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>50,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-6/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                </div>
                <div className='p-8 bg-white flex-1'>
                    <h3 className='text-xl mb-3'>팀 활동비 계좌 잔액</h3>
                    <h2 className='text-3xl tracking-tight'><span className='font-bold'>37,000</span> 원</h2>
                    <div className='mt-14'>
                        <div className='flex justify-between mb-4'>
                            <span className='text-xl font-bold'>토마스</span>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>10,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-11/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                    <div className='mt-12'>
                        <div className='flex justify-between mb-4'>
                            <span className='text-xl font-bold'>크리스티나</span>
                            <span className='text-xl text-gray-400'><span className='font-bold text-black'>27,000원</span> 남음</span>
                        </div>
                        <div className='relative'>
                            <div className='absolute top-0 left-0 w-10/12 h-3 bg-blue-500 rounded-full'></div>
                            <div className='w-full h-3 bg-gray-200 rounded-full'></div>
                        </div>
                    </div>
                </div> */}